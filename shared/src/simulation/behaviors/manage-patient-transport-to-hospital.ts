import {
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
    PatientStatus,
    PatientTransferOccupation,
    currentSimulatedRegionOf,
    getCreate,
    isInSpecificSimulatedRegion,
    patientStatusAllowedValues,
} from '../../models/utils';
import type { Mutable } from '../../utils';
import {
    UUID,
    UUIDSet,
    cloneDeepMutable,
    uuid,
    uuidValidationOptions,
} from '../../utils';
import { IsLiteralUnion, IsUUIDSet, IsValue } from '../../utils/validators';
import { addActivity } from '../activities/utils';
import { nextUUID } from '../utils/randomness';
import {
    DelayEventActivityState,
    RecurringEventActivityState,
    SendRemoteEventActivityState,
} from '../activities';
import {
    AskForPatientDataEvent,
    PatientCategoryTransferToHospitalFinishedEvent,
    TransferVehiclesRequestEvent,
    TryToSendToHospitalEvent,
} from '../events';
import type { PatientCount } from '../../models/radiogram';
import { RadiogramUnpublishedStatus } from '../../models/radiogram';
import { IsPatientsPerUUID } from '../../utils/validators/is-patients-per-uuid';
import { publishRadiogram } from '../../models/radiogram/radiogram-helpers-mutable';
import { NewPatientDataRequestedRadiogram } from '../../models/radiogram/new-patient-data-requested';
import { CountPatientsActivityState } from '../activities/count-patients';
import type { ExerciseState } from '../../state';
import type { SimulatedRegion } from '../../models';
import {
    getActivityById,
    getElement,
    getElementByPredicate,
} from '../../store/action-reducers/utils';
import { PatientsTransportPromise } from '../utils/patients-transported-promise';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

interface PatientsPerRegion {
    [simulatedRegionId: UUID]: PatientCount;
}

class VehiclesForPatients {
    @IsValue('vehiclesForPatients')
    readonly type = 'vehiclesForPatients';

    @IsString({ each: true })
    readonly red: string[] = ['RTW'];

    @IsInt()
    @Min(0)
    readonly redIndex: number = 0;

    @IsString({ each: true })
    readonly yellow: string[] = ['RTW'];

    @IsInt()
    @Min(0)
    readonly yellowIndex: number = 0;

    @IsString({ each: true })
    readonly green: string[] = ['RTW', 'KTW'];

    @IsInt()
    @Min(0)
    readonly greenIndex: number = 0;

    static readonly create = getCreate(this);
}

export class ManagePatientTransportToHospitalBehaviorState
    implements SimulationBehaviorState
{
    @IsValue('managePatientTransportToHospitalBehavior')
    readonly type = 'managePatientTransportToHospitalBehavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public readonly requestTargetId!: UUID;

    @IsUUIDSet()
    public readonly simulatedRegionsToManage: UUIDSet = {};

    @IsPatientsPerUUID()
    public readonly patientsExpectedInRegions!: PatientsPerRegion;

    @Type(() => PatientsTransportPromise)
    @ValidateNested()
    public readonly patientsExpectedToStillBeTransportedByRegion: PatientsTransportPromise[] =
        [];

    @Type(() => VehiclesForPatients)
    @ValidateNested()
    public readonly vehiclesForPatients: VehiclesForPatients =
        VehiclesForPatients.create();

    /**
     * @deprecated Use {@link updateRequestVehiclesDelay} instead
     */
    @IsInt()
    @Min(0)
    public readonly requestVehiclesDelay: number = 0;

    /**
     * @deprecated Use {@link updateRequestPatientCountsDelay} instead
     */
    @IsInt()
    @Min(0)
    public readonly requestPatientCountsDelay: number = 0;

    @IsInt()
    @Min(0)
    public readonly promiseInvalidationInterval: number = 0;

    @IsLiteralUnion(patientStatusAllowedValues)
    public readonly maximumCategoryToTransport!: PatientStatus;

    @IsOptional()
    @IsUUID()
    readonly recurringPatientDataRequestActivity?: UUID;

    @IsOptional()
    @IsUUID()
    readonly recurringSendToHospitalActivity?: UUID;

    static readonly create = getCreate(this);
}

export const managePatientTransportToHospitalBehavior: SimulationBehavior<ManagePatientTransportToHospitalBehaviorState> =
    {
        behaviorState: ManagePatientTransportToHospitalBehaviorState,
        handleEvent: (draftState, simulatedRegion, behaviorState, event) => {
            switch (event.type) {
                case 'tickEvent':
                    {
                        // initialize recurring activities if needed

                        if (
                            !behaviorState.recurringPatientDataRequestActivity
                        ) {
                            behaviorState.recurringPatientDataRequestActivity =
                                nextUUID(draftState);
                            addActivity(
                                simulatedRegion,
                                RecurringEventActivityState.create(
                                    behaviorState.recurringPatientDataRequestActivity,
                                    AskForPatientDataEvent.create(
                                        behaviorState.id
                                    ),
                                    draftState.currentTime,
                                    behaviorState.requestPatientCountsDelay
                                )
                            );
                        }

                        if (!behaviorState.recurringSendToHospitalActivity) {
                            behaviorState.recurringSendToHospitalActivity =
                                nextUUID(draftState);
                            addActivity(
                                simulatedRegion,
                                RecurringEventActivityState.create(
                                    behaviorState.recurringSendToHospitalActivity,
                                    TryToSendToHospitalEvent.create(
                                        behaviorState.id
                                    ),
                                    draftState.currentTime,
                                    behaviorState.requestVehiclesDelay
                                )
                            );
                        }
                    }
                    break;
                case 'tryToSendToHospitalEvent':
                    {
                        // only react if this event is meant for this behavior
                        if (event.behaviorId !== behaviorState.id) {
                            break;
                        }

                        const patientsInRegions =
                            patientsExpectedInRegionsAfterTransports(
                                draftState,
                                behaviorState
                            );
                        const simulatedRegions = cloneDeepMutable(
                            behaviorState.simulatedRegionsToManage
                        );
                        orderedPatientCategories
                            .slice(
                                0,
                                orderedPatientCategories.indexOf(
                                    behaviorState.maximumCategoryToTransport
                                ) + 1
                            )
                            .forEach((category) => {
                                Object.keys(simulatedRegions)
                                    .filter(
                                        (simulatedRegionId) =>
                                            (patientsInRegions[
                                                simulatedRegionId
                                            ]?.[category] ?? 0) > 0
                                    )
                                    .forEach((simulatedRegionId) => {
                                        delete simulatedRegions[
                                            simulatedRegionId
                                        ];

                                        const vehicleType =
                                            getNextVehicleForPatientStatus(
                                                behaviorState,
                                                category
                                            );
                                        if (vehicleType) {
                                            const targetTransferPoint =
                                                getElementByPredicate(
                                                    draftState,
                                                    'transferPoint',
                                                    (transferPoint) =>
                                                        isInSpecificSimulatedRegion(
                                                            transferPoint,
                                                            simulatedRegionId
                                                        )
                                                );

                                            addActivity(
                                                simulatedRegion,
                                                SendRemoteEventActivityState.create(
                                                    nextUUID(draftState),
                                                    behaviorState.requestTargetId,
                                                    TransferVehiclesRequestEvent.create(
                                                        { vehicleType: 1 },
                                                        simulatedRegion.id,
                                                        'transferPoint',
                                                        targetTransferPoint.id,
                                                        undefined,
                                                        PatientTransferOccupation.create(
                                                            simulatedRegion.id
                                                        )
                                                    )
                                                )
                                            );
                                        }
                                    });
                            });
                    }
                    break;

                case 'patientTransferToHospitalSuccessfulEvent':
                    {
                        if (
                            behaviorState.patientsExpectedInRegions[
                                event.patientOriginSimulatedRegion
                            ]
                        ) {
                            behaviorState.patientsExpectedInRegions[
                                event.patientOriginSimulatedRegion
                            ]![event.patientCategory]--;

                            const promiseForThisRegion =
                                behaviorState.patientsExpectedToStillBeTransportedByRegion.find(
                                    (promise) =>
                                        promise.targetSimulatedRegionId ===
                                            event.patientOriginSimulatedRegion &&
                                        promise.patientCount > 0
                                );

                            if (promiseForThisRegion) {
                                promiseForThisRegion.patientCount--;
                            }

                            if (
                                Object.values(
                                    behaviorState.patientsExpectedInRegions
                                ).every(
                                    (patientCount) =>
                                        patientCount[event.patientCategory] ===
                                        0
                                )
                            ) {
                                addActivity(
                                    simulatedRegion,
                                    DelayEventActivityState.create(
                                        nextUUID(draftState),
                                        PatientCategoryTransferToHospitalFinishedEvent.create(
                                            event.patientCategory,
                                            false
                                        ),
                                        draftState.currentTime
                                    )
                                );
                            }
                        }
                    }
                    break;

                case 'askForPatientDataEvent':
                    {
                        // only react if this event is meant for this behavior

                        if (event.behaviorId !== behaviorState.id) {
                            break;
                        }

                        // if it manages its own simulated region initiate a patient count

                        if (
                            behaviorState.simulatedRegionsToManage[
                                simulatedRegion.id
                            ]
                        ) {
                            addActivity(
                                simulatedRegion,
                                CountPatientsActivityState.create(
                                    nextUUID(draftState)
                                )
                            );
                        }

                        if (
                            Object.keys(
                                behaviorState.simulatedRegionsToManage
                            ).some(
                                (simulatedRegionId) =>
                                    simulatedRegionId !== simulatedRegion.id
                            )
                        ) {
                            publishRadiogram(
                                draftState,
                                cloneDeepMutable(
                                    NewPatientDataRequestedRadiogram.create(
                                        nextUUID(draftState),
                                        simulatedRegion.id,
                                        RadiogramUnpublishedStatus.create()
                                    )
                                )
                            );
                        }
                    }
                    break;

                case 'patientsCountedEvent':
                    {
                        behaviorState.patientsExpectedInRegions[
                            simulatedRegion.id
                        ] = event.patientCount;
                    }
                    break;

                case 'vehiclesSentEvent':
                    {
                        const transferPoint = getElement(
                            draftState,
                            'transferPoint',
                            event.transferPointDestinationId
                        );
                        const sendSimulatedRegion = currentSimulatedRegionOf(
                            draftState,
                            transferPoint
                        );

                        const numberOfPatients = Object.entries(
                            event.vehiclesSent.vehicleCounts
                        ).reduce((sum, [type, count]) => {
                            const vehicleTemplate =
                                draftState.vehicleTemplates.find(
                                    (template) => template.vehicleType === type
                                );

                            return (
                                sum +
                                (vehicleTemplate?.patientCapacity ?? 0) * count
                            );
                        }, 0);

                        behaviorState.patientsExpectedToStillBeTransportedByRegion.push(
                            cloneDeepMutable(
                                PatientsTransportPromise.create(
                                    draftState.currentTime,
                                    numberOfPatients,
                                    sendSimulatedRegion.id
                                )
                            )
                        );
                    }
                    break;
                default:
                // Ignore event
            }
        },
    };

const orderedPatientCategories: PatientStatus[] = [
    'red',
    'yellow',
    'green',
    'white',
    'blue',
    'black',
];

export function updateRequestVehiclesDelay(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<ManagePatientTransportToHospitalBehaviorState>,
    newDelay: number
) {
    behaviorState.requestVehiclesDelay = newDelay;
    if (behaviorState.recurringSendToHospitalActivity) {
        const activity = getActivityById(
            draftState,
            simulatedRegion.id,
            behaviorState.recurringSendToHospitalActivity,
            'recurringEventActivity'
        );
        activity.recurrenceIntervalTime = newDelay;
    }
}

export function updateRequestPatientCountsDelay(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<ManagePatientTransportToHospitalBehaviorState>,
    newDelay: number
) {
    behaviorState.requestPatientCountsDelay = newDelay;
    if (behaviorState.recurringPatientDataRequestActivity) {
        const activity = getActivityById(
            draftState,
            simulatedRegion.id,
            behaviorState.recurringPatientDataRequestActivity,
            'recurringEventActivity'
        );
        activity.recurrenceIntervalTime = newDelay;
    }
}

function patientsExpectedInRegionsAfterTransports(
    draftState: Mutable<ExerciseState>,
    behaviorState: Mutable<ManagePatientTransportToHospitalBehaviorState>
) {
    behaviorState.patientsExpectedToStillBeTransportedByRegion =
        behaviorState.patientsExpectedToStillBeTransportedByRegion.filter(
            (promise) =>
                promise.promisedTime +
                    behaviorState.promiseInvalidationInterval >
                draftState.currentTime
        );

    const patientsExpectedInRegions = cloneDeepMutable(
        behaviorState.patientsExpectedInRegions
    );

    behaviorState.patientsExpectedToStillBeTransportedByRegion.forEach(
        (promise) => {
            if (patientsExpectedInRegions[promise.targetSimulatedRegionId]) {
                orderedPatientCategories.forEach((category) => {
                    const patientsTransferred = Math.min(
                        patientsExpectedInRegions[
                            promise.targetSimulatedRegionId
                        ]![category],
                        promise.patientCount
                    );

                    patientsExpectedInRegions[promise.targetSimulatedRegionId]![
                        category
                    ] -= patientsTransferred;
                    promise.patientCount -= patientsTransferred;
                });
            }
        }
    );

    return patientsExpectedInRegions;
}

function getNextVehicleForPatientStatus(
    behaviorState: Mutable<ManagePatientTransportToHospitalBehaviorState>,
    patientStatus: PatientStatus
) {
    if (
        patientStatus !== 'red' &&
        patientStatus !== 'yellow' &&
        patientStatus !== 'green'
    ) {
        return undefined;
    }

    behaviorState.vehiclesForPatients[`${patientStatus}Index`]++;
    if (
        behaviorState.vehiclesForPatients[`${patientStatus}Index`] >=
        behaviorState.vehiclesForPatients[patientStatus].length
    ) {
        behaviorState.vehiclesForPatients[`${patientStatus}Index`] = 0;
    }

    return behaviorState.vehiclesForPatients[patientStatus][
        behaviorState.vehiclesForPatients[`${patientStatus}Index`]
    ];
}
