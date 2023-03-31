import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { getCreate, VehicleResource } from '../../models/utils';
import { cloneDeepMutable, UUID, uuid, UUIDSet } from '../../utils';
import { IsUUIDSet, IsUUIDSetMap, IsValue } from '../../utils/validators';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import {
    RecurringEventActivityState,
    TransferVehiclesActivityState,
} from '../activities';
import { addActivity } from '../activities/utils';
import { TryToDistributeEvent } from '../events/try-to-distribute';
import { nextUUID } from '../utils/randomness';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class AutomaticallyDistributeVehiclesBehaviorState
    implements SimulationBehaviorState
{
    @IsValue('automaticallyDistributeVehiclesBehavior')
    readonly type = 'automaticallyDistributeVehiclesBehavior';

    @IsUUID()
    public readonly id: UUID = uuid();

    @IsUUIDSet()
    public readonly distributionDestinations: UUIDSet = {};

    @IsResourceDescription()
    public readonly distributionLimits: { [vehicleType: string]: number } = {};

    @IsResourceDescription()
    public readonly distributedRounds: { [vehicleType: string]: number } = {};

    @IsResourceDescription()
    public readonly distributedLastRound: { [vehicleType: string]: number } =
        {};

    @IsUUIDSetMap()
    public readonly remainingInNeed: { [vehicleType: string]: UUIDSet } = {};

    @IsInt()
    @Min(1)
    /*
     * This *MUST* be greater that the tick Duration to Ensure that we can wait for a response in the next tick
     */
    public readonly distributionDelay: number = 60_000; // 1 minute

    @IsUUID()
    @IsOptional()
    public readonly recurringActivityId!: UUID;

    static readonly create = getCreate(this);
}

export const automaticallyDistributeVehiclesBehavior: SimulationBehavior<AutomaticallyDistributeVehiclesBehaviorState> =
    {
        behaviorState: AutomaticallyDistributeVehiclesBehaviorState,
        handleEvent: (draftState, simulatedRegion, behaviorState, event) => {
            switch (event.type) {
                case 'tickEvent': {
                    if (!behaviorState.recurringActivityId) {
                        // initialize recurring activity
                        behaviorState.recurringActivityId =
                            nextUUID(draftState);
                        addActivity(
                            simulatedRegion,
                            RecurringEventActivityState.create(
                                behaviorState.recurringActivityId,
                                TryToDistributeEvent.create(behaviorState.id),
                                draftState.currentTime,
                                behaviorState.distributionDelay
                            )
                        );
                    }
                    break;
                }
                case 'tryToDistributeEvent':
                    {
                        // Don't do anything until there is a region to distribute to

                        if (
                            Object.keys(behaviorState.distributionDestinations)
                                .length === 0
                        ) {
                            return;
                        }

                        // Check for completed rounds

                        Object.entries(behaviorState.remainingInNeed).forEach(
                            ([vehicleType, regionsInNeed]) => {
                                if (Object.keys(regionsInNeed).length === 0) {
                                    if (
                                        !behaviorState.distributedRounds[
                                            vehicleType
                                        ]
                                    ) {
                                        behaviorState.distributedRounds[
                                            vehicleType
                                        ] = 0;
                                    }
                                    if (
                                        (behaviorState.distributedLastRound[
                                            vehicleType
                                        ] ?? 0) > 0
                                    ) {
                                        behaviorState.distributedRounds[
                                            vehicleType
                                        ]++;
                                    }

                                    behaviorState.remainingInNeed[vehicleType] =
                                        behaviorState.distributionDestinations;
                                }
                                behaviorState.distributedLastRound[
                                    vehicleType
                                ] = 0;
                            }
                        );

                        // distribute

                        const regionsOrderedByNeed = Object.keys(
                            cloneDeepMutable(
                                behaviorState.distributionDestinations
                            )
                        );
                        regionsOrderedByNeed.sort(
                            (a, b) =>
                                Object.values(
                                    behaviorState.remainingInNeed
                                ).reduce((c, d) => c + (d[b] ? 1 : 0), 0) -
                                Object.values(
                                    behaviorState.remainingInNeed
                                ).reduce((c, d) => c + (d[a] ? 1 : 0), 0)
                        );

                        const vehiclesToBeSent: {
                            [region: UUID]: { [vehicletype: string]: 1 };
                        } = {};

                        Object.entries(behaviorState.remainingInNeed).forEach(
                            ([vehicleType, regionsInNeed]) => {
                                if (
                                    (behaviorState.distributedRounds[
                                        vehicleType
                                    ] ?? 0) >=
                                    (behaviorState.distributionLimits[
                                        vehicleType
                                    ] ?? 0)
                                ) {
                                    return;
                                }

                                Object.keys(regionsInNeed).forEach((region) => {
                                    if (!vehiclesToBeSent[region]) {
                                        vehiclesToBeSent[region] = {};
                                    }
                                    vehiclesToBeSent[region]![vehicleType] = 1;
                                });
                            }
                        );

                        regionsOrderedByNeed.forEach((region) => {
                            if (!vehiclesToBeSent[region]) {
                                return;
                            }
                            addActivity(
                                simulatedRegion,
                                TransferVehiclesActivityState.create(
                                    nextUUID(draftState),
                                    region,
                                    'automatic-distribution',
                                    VehicleResource.create(
                                        cloneDeepMutable(
                                            vehiclesToBeSent[region]!
                                        )
                                    )
                                )
                            );
                        });
                    }
                    break;
                case 'transferConnectionMissingEvent':
                    {
                        // If a connection is missing the vehicle counts as sent

                        Object.entries(behaviorState.remainingInNeed).forEach(
                            ([vehicleType, regionsInNeed]) => {
                                if (
                                    (behaviorState.distributedRounds[
                                        vehicleType
                                    ] ?? 0) >=
                                    (behaviorState.distributionLimits[
                                        vehicleType
                                    ] ?? 0)
                                ) {
                                    return;
                                }
                                if (regionsInNeed[event.transferPointId]) {
                                    delete regionsInNeed[event.transferPointId];
                                }
                            }
                        );
                    }
                    break;
                case 'vehicleTransferSuccessfulEvent':
                    {
                        if (event.key !== 'automatic-distribution') {
                            return;
                        }

                        Object.entries(
                            event.vehiclesSent.vehicleCounts
                        ).forEach(([vehicleType, vehicleAmount]) => {
                            if (vehicleAmount < 1) {
                                return;
                            }
                            if (
                                !behaviorState.distributedLastRound[vehicleType]
                            ) {
                                behaviorState.distributedLastRound[
                                    vehicleType
                                ] = 0;
                            }
                            behaviorState.distributedLastRound[vehicleType]++;

                            if (behaviorState.remainingInNeed[vehicleType]) {
                                delete behaviorState.remainingInNeed[
                                    vehicleType
                                ]![event.targetId];
                            }
                        });
                    }
                    break;

                default:
                // Ignore event
            }
        },
    };
