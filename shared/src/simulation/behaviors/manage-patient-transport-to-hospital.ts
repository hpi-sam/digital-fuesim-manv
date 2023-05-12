import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { isEqual } from 'lodash-es';
import {
    PatientStatus,
    PatientTransferOccupation,
    getCreate,
    patientStatusAllowedValues,
} from '../../models/utils';
import type { Mutable } from '../../utils';
import {
    StrictObject,
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
    RetryToSendToHospitalEvent,
    TransferVehiclesRequestEvent,
    TryToSendToHospitalEvent,
} from '../events';
import type { PatientCount } from '../../models/radiogram';
import { RadiogramUnpublishedStatus } from '../../models/radiogram';
import { IsPatientsPerUUID } from '../../utils/validators/is-patients-per-uuid';
import { publishRadiogram } from '../../models/radiogram/radiogram-helpers-mutable';
import { NewPatientDataRequestedRadiogram } from '../../models/radiogram/new-patient-data-requested';
import { CountPatientsActivityState } from '../activities/count-patients';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

interface PatientsPerRegion {
    [simulatedRegionId: UUID]: PatientCount;
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

    @IsPatientsPerUUID()
    public readonly patientsExpectedInRegionsAfterTransports!: PatientsPerRegion;

    @IsPatientsPerUUID()
    public readonly patientsTransportedToHospital!: PatientsPerRegion;

    @IsInt()
    @Min(0)
    public readonly requestVehiclesDelay: number = 0;

    @IsInt()
    @Min(0)
    public readonly requestPatientCountsDelay: number = 0;

    @IsInt()
    @Min(0)
    public readonly retryDelay: number = 0;

    @IsLiteralUnion(patientStatusAllowedValues)
    public readonly maximumCategoryToTransport!: PatientStatus;

    @IsOptional()
    @IsUUID()
    recurringPatientDataRequestActivity?: UUID;

    @IsOptional()
    @IsUUID()
    recurringSendToHospitalActivity?: UUID;

    static readonly create = getCreate(this);
}

export const managePatientTransportToHospitalBehavior: SimulationBehavior<ManagePatientTransportToHospitalBehaviorState> =
    {
        behaviorState: ManagePatientTransportToHospitalBehaviorState,
        handleEvent: (draftState, simulatedRegion, behaviorState, event) => {
            switch (event.type) {
                case 'tickEvent':
                    {
                        // initialize recurring activities oif needed

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

                        // find region that is in biggest need

                        let highestCategoryThatIsNeeded:
                            | PatientStatus
                            | undefined;
                        let numberOfPatientsNeededInHighestCategory = 0;
                        let simulatedRegionWithBiggestNeed: UUID | undefined;

                        Object.entries(
                            behaviorState.patientsExpectedInRegionsAfterTransports
                        ).forEach(([simulatedRegionId, patientCounts]) => {
                            for (const category of orderedPatientCategories) {
                                if (patientCounts[category] > 0) {
                                    if (
                                        category === highestCategoryThatIsNeeded
                                    ) {
                                        if (
                                            numberOfPatientsNeededInHighestCategory <
                                            patientCounts[category]
                                        ) {
                                            simulatedRegionWithBiggestNeed =
                                                simulatedRegionId;
                                            numberOfPatientsNeededInHighestCategory =
                                                patientCounts[category];
                                        }
                                        break;
                                    } else {
                                        highestCategoryThatIsNeeded = category;
                                        numberOfPatientsNeededInHighestCategory =
                                            patientCounts[category];
                                        simulatedRegionWithBiggestNeed =
                                            simulatedRegionId;
                                    }
                                }
                                if (category === highestCategoryThatIsNeeded) {
                                    break;
                                }
                            }
                        });

                        // if no region is in need don't do anything

                        if (!simulatedRegionWithBiggestNeed) {
                            break;
                        }

                        // request one vehicle to be send to the region with the highest need

                        addActivity(
                            simulatedRegion,
                            SendRemoteEventActivityState.create(
                                nextUUID(draftState),
                                behaviorState.requestTargetId,
                                TransferVehiclesRequestEvent.create(
                                    { RTW: 1 },
                                    simulatedRegion.id,
                                    'transferPoint',
                                    simulatedRegionWithBiggestNeed!,
                                    `TTHFirst-${highestCategoryThatIsNeeded}`,
                                    PatientTransferOccupation.create(
                                        simulatedRegion.id
                                    )
                                )
                            )
                        );

                        behaviorState.patientsExpectedInRegionsAfterTransports[
                            simulatedRegionWithBiggestNeed
                        ]![highestCategoryThatIsNeeded!]--;
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

                            if (
                                behaviorState.patientsExpectedInRegions[
                                    event.patientOriginSimulatedRegion
                                ]![event.patientCategory] < 1
                            ) {
                                for (const category of orderedPatientCategories) {
                                    if (
                                        behaviorState.patientsExpectedInRegions[
                                            event.patientOriginSimulatedRegion
                                        ]![category] > 0
                                    ) {
                                        break;
                                    }
                                    if (category === event.patientCategory) {
                                        addActivity(
                                            simulatedRegion,
                                            DelayEventActivityState.create(
                                                nextUUID(draftState),
                                                PatientCategoryTransferToHospitalFinishedEvent.create(
                                                    category,
                                                    false
                                                ),
                                                draftState.currentTime
                                            )
                                        );
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 'retryToSendToHospitalEvent':
                    {
                        // only react if this event is meant for this behavior

                        if (event.behaviorId !== behaviorState.id) {
                            break;
                        }

                        addActivity(
                            simulatedRegion,
                            SendRemoteEventActivityState.create(
                                nextUUID(draftState),
                                behaviorState.requestTargetId,
                                TransferVehiclesRequestEvent.create(
                                    event.patientCategory === 'green'
                                        ? { KTW: 1 }
                                        : { RTW: 1 },
                                    simulatedRegion.id,
                                    'transferPoint',
                                    event.transferDestinationId,
                                    `TTHSecond-${event.patientCategory}`,
                                    PatientTransferOccupation.create(
                                        simulatedRegion.id
                                    )
                                )
                            )
                        );
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
                    break;

                case 'patientsCountedEvent':
                    {
                        reCalculatePatientsInSimulatedRegion(
                            behaviorState,
                            simulatedRegion.id,
                            event.patientCount
                        );
                    }
                    break;

                case 'vehiclesSentEvent':
                    {
                        if (!event.key) {
                            return;
                        }
                        if (
                            (event.vehiclesSent.vehicleCounts['RTW'] ?? 0) === 0
                        ) {
                            const t = event.key.split('-')[0];
                            const c = event.key.split('-')[1] as PatientStatus;
                            if (t !== 'TTHFirst' && t !== 'TTHSecond') {
                                return;
                            }
                            if (t === 'TTHFirst') {
                                addActivity(
                                    simulatedRegion,
                                    DelayEventActivityState.create(
                                        nextUUID(draftState),
                                        RetryToSendToHospitalEvent.create(
                                            behaviorState.id,
                                            event.transferDestinationId,
                                            c
                                        ),
                                        draftState.currentTime +
                                            behaviorState.retryDelay
                                    )
                                );
                            }
                            if (t === 'TTHSecond') {
                                behaviorState
                                    .patientsExpectedInRegionsAfterTransports[
                                    event.transferDestinationId
                                ]![c]!--;
                            }
                        }
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

export function reCalculatePatientsInSimulatedRegion(
    managePatientTransportToHospitalBehaviorState: Mutable<ManagePatientTransportToHospitalBehaviorState>,
    simulatedRegionId: UUID,
    newData: PatientCount
) {
    if (
        isEqual(
            managePatientTransportToHospitalBehaviorState
                .patientsExpectedInRegions[simulatedRegionId],
            newData
        )
    ) {
        return;
    }
    const difference = Object.fromEntries(
        StrictObject.entries(newData).map(([patientType, patientCount]) => [
            patientType,
            patientCount -
                (managePatientTransportToHospitalBehaviorState
                    .patientsExpectedInRegions[simulatedRegionId]?.[
                    patientType
                ] ?? 0),
        ])
    );
    managePatientTransportToHospitalBehaviorState.patientsExpectedInRegions[
        simulatedRegionId
    ] = newData;
    if (
        !managePatientTransportToHospitalBehaviorState
            .patientsExpectedInRegionsAfterTransports[simulatedRegionId]
    ) {
        managePatientTransportToHospitalBehaviorState.patientsExpectedInRegionsAfterTransports[
            simulatedRegionId
        ] = { red: 0, yellow: 0, green: 0, blue: 0, black: 0, white: 0 };
    }
    for (const category of orderedPatientCategories) {
        managePatientTransportToHospitalBehaviorState.patientsExpectedInRegionsAfterTransports[
            simulatedRegionId
        ]![category] += difference[category] ?? 0;
    }
}
