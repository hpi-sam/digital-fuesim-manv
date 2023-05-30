import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { cloneDeep } from 'lodash-es';
import { getCreate } from '../../models/utils/get-create';
import type { Mutable } from '../../utils';
import { cloneDeepMutable, UUID, uuid, UUIDSet } from '../../utils';
import { IsUUIDSet, IsUUIDSetMap, IsValue } from '../../utils/validators';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import {
    DelayEventActivityState,
    RecurringEventActivityState,
} from '../activities';
import { addActivity } from '../activities/utils';
import { TryToDistributeEvent } from '../events/try-to-distribute';
import { nextUUID } from '../utils/randomness';
import { TransferVehiclesRequestEvent } from '../events';
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
     * This *MUST* be greater than about 10 tick durations to Ensure that we can wait for a response
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
                        // Ignore the event if it is not meant for this behavior

                        if (event.behaviorId !== behaviorState.id) {
                            return;
                        }

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

                                    // Check if a vehicle was distributed during the last distribution try
                                    // to not increase the distributed rounds if all transfer connections were missing

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
                            (regionIdA, regionIdB) =>
                                numberOfDifferentVehiclesNeeded(
                                    behaviorState,
                                    regionIdB
                                ) -
                                numberOfDifferentVehiclesNeeded(
                                    behaviorState,
                                    regionIdA
                                )
                        );

                        const vehiclesToBeSent: {
                            [region: UUID]: { [vehicletype: string]: 1 };
                        } = {};

                        Object.entries(behaviorState.remainingInNeed).forEach(
                            ([vehicleType, regionsInNeed]) => {
                                if (
                                    distributionLimitOfVehicleTypeReached(
                                        behaviorState,
                                        vehicleType
                                    )
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
                                DelayEventActivityState.create(
                                    nextUUID(draftState),
                                    TransferVehiclesRequestEvent.create(
                                        cloneDeep(vehiclesToBeSent[region]!),
                                        'transferPoint',
                                        region,
                                        simulatedRegion.id,
                                        'automatic-distribution'
                                    ),
                                    draftState.currentTime
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
                                    distributionLimitOfVehicleTypeReached(
                                        behaviorState,
                                        vehicleType
                                    )
                                ) {
                                    return;
                                }
                                delete regionsInNeed[event.transferPointId];
                            }
                        );
                    }
                    break;
                case 'requestReceivedEvent':
                    {
                        if (event.key !== 'automatic-distribution') {
                            return;
                        }

                        Object.entries(event.availableVehicles).forEach(
                            ([vehicleType, vehicleAmount]) => {
                                if (vehicleAmount === 0) {
                                    return;
                                }
                                if (
                                    !behaviorState.distributedLastRound[
                                        vehicleType
                                    ]
                                ) {
                                    behaviorState.distributedLastRound[
                                        vehicleType
                                    ] = 0;
                                }
                                behaviorState.distributedLastRound[
                                    vehicleType
                                ]++;

                                if (
                                    behaviorState.remainingInNeed[vehicleType]
                                ) {
                                    delete behaviorState.remainingInNeed[
                                        vehicleType
                                    ]![event.transferDestinationId];
                                }
                            }
                        );
                    }
                    break;

                default:
                // Ignore event
            }
        },
    };

function distributionLimitOfVehicleTypeReached(
    behaviorState: Mutable<AutomaticallyDistributeVehiclesBehaviorState>,
    vehicleType: string
) {
    return (
        (behaviorState.distributedRounds[vehicleType] ?? 0) >=
        (behaviorState.distributionLimits[vehicleType] ?? 0)
    );
}

function numberOfDifferentVehiclesNeeded(
    behaviorState: Mutable<AutomaticallyDistributeVehiclesBehaviorState>,
    regionId: string
) {
    return Object.values(behaviorState.remainingInNeed).reduce(
        (numberOfVehiclesNeededByRegion, regionsInNeed) => {
            if (regionsInNeed[regionId]) {
                return numberOfVehiclesNeededByRegion + 1;
            }
            return numberOfVehiclesNeededByRegion;
        },
        0
    );
}
