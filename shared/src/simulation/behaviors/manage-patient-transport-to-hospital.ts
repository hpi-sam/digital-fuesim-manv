import {
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { PatientStatus } from '../../models/utils';
import {
    PatientStatusForTransport,
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
    PublishRadiogramActivityState,
    RecurringEventActivityState,
    SendRemoteEventActivityState,
} from '../activities';
import {
    AskForPatientDataEvent,
    PatientCategoryTransferToHospitalFinishedEvent,
    TransferVehiclesRequestEvent,
    TryToSendToHospitalEvent,
} from '../events';
import { RadiogramUnpublishedStatus } from '../../models/radiogram';
import { IsPatientsPerUUID } from '../../utils/validators/is-patients-per-uuid';
import { NewPatientDataRequestedRadiogram } from '../../models/radiogram/new-patient-data-requested-radiogram';
import { CountPatientsActivityState } from '../activities/count-patients';
import type { ExerciseState } from '../../state';
import {
    getActivityById,
    getElement,
    getElementByPredicate,
} from '../../store/action-reducers/utils';
import { PatientsTransportPromise } from '../utils/patients-transported-promise';
import type { ResourceDescription } from '../../models/utils/resource-description';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

interface PatientsPerRegion {
    [simulatedRegionId: UUID]: ResourceDescription<PatientStatus>;
}

class VehiclesForPatients {
    @IsValue('vehiclesForPatients')
    readonly type = 'vehiclesForPatients';

    @IsString({ each: true })
    readonly red: readonly string[] = ['RTW'];

    @IsInt()
    @Min(0)
    readonly redIndex: number = 0;

    @IsString({ each: true })
    readonly yellow: readonly string[] = ['RTW'];

    @IsInt()
    @Min(0)
    readonly yellowIndex: number = 0;

    @IsString({ each: true })
    readonly green: readonly string[] = ['RTW', 'KTW'];

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
    public readonly patientsExpectedToStillBeTransportedByRegion: readonly PatientsTransportPromise[] =
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
    public readonly requestVehiclesDelay: number = 60 * 1000;

    /**
     * @deprecated Use {@link updateRequestPatientCountsDelay} instead
     */
    @IsInt()
    @Min(0)
    public readonly requestPatientCountsDelay: number = 15 * 60 * 1000;

    @IsInt()
    @Min(0)
    public readonly promiseInvalidationInterval: number = 30 * 60 * 1000;

    @IsLiteralUnion(patientStatusAllowedValues)
    public readonly maximumCategoryToTransport!: PatientStatusForTransport;

    @IsOptional()
    @IsUUID(4, uuidValidationOptions)
    readonly recurringPatientDataRequestActivityId?: UUID;

    @IsOptional()
    @IsUUID(4, uuidValidationOptions)
    readonly recurringSendToHospitalActivityId?: UUID;

    static readonly create = getCreate(this);
}

export const managePatientTransportToHospitalBehavior: SimulationBehavior<ManagePatientTransportToHospitalBehaviorState> =
    {
        behaviorState: ManagePatientTransportToHospitalBehaviorState,
        handleEvent: (draftState, simulatedRegion, behaviorState, event) => {
            switch (event.type) {
                case 'tickEvent': {
                    // initialize recurring activities if needed

                    if (!behaviorState.recurringPatientDataRequestActivityId) {
                        behaviorState.recurringPatientDataRequestActivityId =
                            nextUUID(draftState);
                        addActivity(
                            simulatedRegion,
                            RecurringEventActivityState.create(
                                behaviorState.recurringPatientDataRequestActivityId,
                                AskForPatientDataEvent.create(behaviorState.id),
                                draftState.currentTime,
                                behaviorState.requestPatientCountsDelay
                            )
                        );
                    }

                    if (!behaviorState.recurringSendToHospitalActivityId) {
                        behaviorState.recurringSendToHospitalActivityId =
                            nextUUID(draftState);
                        addActivity(
                            simulatedRegion,
                            RecurringEventActivityState.create(
                                behaviorState.recurringSendToHospitalActivityId,
                                TryToSendToHospitalEvent.create(
                                    behaviorState.id
                                ),
                                draftState.currentTime,
                                behaviorState.requestVehiclesDelay
                            )
                        );
                    }
                    break;
                }
                case 'tryToSendToHospitalEvent': {
                    // only react if this event is meant for this behavior
                    if (event.behaviorId !== behaviorState.id) {
                        break;
                    }

                    const patientsExpectedInRegions =
                        patientsExpectedInRegionsAfterTransports(
                            draftState,
                            behaviorState
                        );

                    const highestCategoryThatIsNeeded =
                        orderedPatientCategories.find((category) =>
                            Object.values(patientsExpectedInRegions).some(
                                (patientCounts) => patientCounts[category] > 0
                            )
                        );

                    if (
                        !highestCategoryThatIsNeeded ||
                        orderedPatientCategories.indexOf(
                            highestCategoryThatIsNeeded
                        ) >
                            orderedPatientCategories.indexOf(
                                behaviorState.maximumCategoryToTransport
                            )
                    ) {
                        break;
                    }

                    const simulatedRegionIdWithBiggestNeed = Object.entries(
                        patientsExpectedInRegions
                    ).sort(
                        ([, patientCountsA], [, patientCountsB]) =>
                            patientCountsB[highestCategoryThatIsNeeded] -
                            patientCountsA[highestCategoryThatIsNeeded]
                    )[0]![0];

                    const vehicleType = getNextVehicleForPatientStatus(
                        behaviorState,
                        highestCategoryThatIsNeeded
                    );

                    const targetTransferPoint = getElementByPredicate(
                        draftState,
                        'transferPoint',
                        (transferPoint) =>
                            isInSpecificSimulatedRegion(
                                transferPoint,
                                simulatedRegionIdWithBiggestNeed
                            )
                    );

                    if (vehicleType) {
                        addActivity(
                            simulatedRegion,
                            SendRemoteEventActivityState.create(
                                nextUUID(draftState),
                                behaviorState.requestTargetId,
                                TransferVehiclesRequestEvent.create(
                                    { [vehicleType]: 1 },
                                    'transferPoint',
                                    targetTransferPoint.id,
                                    simulatedRegion.id,
                                    undefined,
                                    PatientTransferOccupation.create(
                                        simulatedRegion.id
                                    )
                                )
                            )
                        );
                    }
                    break;
                }

                case 'patientTransferToHospitalSuccessfulEvent': {
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
                                    patientCount[event.patientCategory] === 0
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
                    break;
                }

                case 'askForPatientDataEvent': {
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
                        addActivity(
                            simulatedRegion,
                            PublishRadiogramActivityState.create(
                                nextUUID(draftState),
                                NewPatientDataRequestedRadiogram.create(
                                    nextUUID(draftState),
                                    simulatedRegion.id,
                                    RadiogramUnpublishedStatus.create()
                                )
                            )
                        );
                    }
                    break;
                }
                case 'patientsCountedEvent': {
                    behaviorState.patientsExpectedInRegions[
                        simulatedRegion.id
                    ] = event.patientCount;
                    break;
                }
                case 'vehiclesSentEvent': {
                    const transferPoint = getElement(
                        draftState,
                        'transferPoint',
                        event.destinationTransferPointId
                    );
                    const destinationSimulatedRegion = currentSimulatedRegionOf(
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
                                destinationSimulatedRegion.id
                            )
                        )
                    );
                    break;
                }
                default:
                // Ignore event
            }
        },
    };

const orderedPatientCategories: PatientStatusForTransport[] = [
    'red',
    'yellow',
    'green',
];

export function updateRequestVehiclesDelay(
    draftState: Mutable<ExerciseState>,
    simulatedRegionId: UUID,
    behaviorState: Mutable<ManagePatientTransportToHospitalBehaviorState>,
    newDelay: number
) {
    behaviorState.requestVehiclesDelay = newDelay;
    if (behaviorState.recurringSendToHospitalActivityId) {
        const activity = getActivityById(
            draftState,
            simulatedRegionId,
            behaviorState.recurringSendToHospitalActivityId,
            'recurringEventActivity'
        );
        activity.recurrenceIntervalTime = newDelay;
    }
}

export function updateRequestPatientCountsDelay(
    draftState: Mutable<ExerciseState>,
    simulatedRegionId: UUID,
    behaviorState: Mutable<ManagePatientTransportToHospitalBehaviorState>,
    newDelay: number
) {
    behaviorState.requestPatientCountsDelay = newDelay;
    if (behaviorState.recurringPatientDataRequestActivityId) {
        const activity = getActivityById(
            draftState,
            simulatedRegionId,
            behaviorState.recurringPatientDataRequestActivityId,
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
    patientStatus: PatientStatusForTransport
) {
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
