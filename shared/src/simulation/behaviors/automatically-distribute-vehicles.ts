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

    @IsUUIDSetMap()
    public readonly remainingInNeed: { [vehicleType: string]: UUIDSet } = {};

    @IsInt()
    @Min(1)
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
                                const regionsOrderedByNeed = Object.keys(
                                    cloneDeepMutable(regionsInNeed)
                                );
                                regionsOrderedByNeed.sort(
                                    (a, b) =>
                                        Object.values(
                                            behaviorState.remainingInNeed
                                        ).reduce(
                                            (c, d) => c + (d[b] ? 1 : 0),
                                            0
                                        ) -
                                        Object.values(
                                            behaviorState.remainingInNeed
                                        ).reduce(
                                            (c, d) => c + (d[a] ? 1 : 0),
                                            0
                                        )
                                );
                                regionsOrderedByNeed.forEach((region) =>
                                    addActivity(
                                        simulatedRegion,
                                        TransferVehiclesActivityState.create(
                                            nextUUID(draftState),
                                            region,
                                            'automatic-distribution',
                                            VehicleResource.create({
                                                vehicleType: 1,
                                            })
                                        )
                                    )
                                );
                            }
                        );
                    }
                    break;
                case 'transferConnectionMissingEvent':
                    {
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
                                    behaviorState.distributedRounds[
                                        vehicleType
                                    ]++;

                                    // eslint-disable-next-line no-param-reassign
                                    regionsInNeed =
                                        behaviorState.distributionDestinations;
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
                            if (behaviorState.remainingInNeed[vehicleType]) {
                                delete behaviorState.remainingInNeed[
                                    vehicleType
                                ]![event.targetId];
                            }
                        });

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
                                    behaviorState.distributedRounds[
                                        vehicleType
                                    ]++;

                                    // eslint-disable-next-line no-param-reassign
                                    regionsInNeed =
                                        behaviorState.distributionDestinations;
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
