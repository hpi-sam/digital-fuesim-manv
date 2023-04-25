import { IsInt, IsUUID, Min } from 'class-validator';
import { getCreate } from '../../models/utils';
import { isUnoccupied } from '../../models/utils/occupations/occupation-helpers-mutable';
import { UnloadingOccupation } from '../../models/utils/occupations/unloading-occupation';
import {
    cloneDeepMutable,
    StrictObject,
    UUID,
    uuid,
    uuidValidationOptions,
} from '../../utils';
import { IsValue } from '../../utils/validators';
import {
    IsUUIDSquaredMap,
    UUIDSquaredMap,
} from '../../utils/validators/is-uuid-uuid-map';
import { UnloadVehicleActivityState } from '../activities/unload-vehicle';
import { addActivity, terminateActivity } from '../activities/utils';
import { nextUUID } from '../utils/randomness';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class UnloadArrivingVehiclesBehaviorState
    implements SimulationBehaviorState
{
    @IsValue('unloadArrivingVehiclesBehavior' as const)
    readonly type = 'unloadArrivingVehiclesBehavior';

    @IsUUID(4, uuidValidationOptions)
    readonly id: UUID = uuid();

    @IsInt()
    @Min(0)
    readonly unloadDelay: number;

    @IsUUIDSquaredMap()
    readonly vehicleActivityMap: UUIDSquaredMap;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        unloadDelay: number = 2 * 60 * 1000,
        vehicleActivityMap: UUIDSquaredMap = {}
    ) {
        this.unloadDelay = unloadDelay;
        this.vehicleActivityMap = vehicleActivityMap;
    }

    static readonly create = getCreate(this);
}

export const unloadArrivingVehiclesBehavior: SimulationBehavior<UnloadArrivingVehiclesBehaviorState> =
    {
        behaviorState: UnloadArrivingVehiclesBehaviorState,
        handleEvent(draftState, simulatedRegion, behaviorState, event) {
            switch (event.type) {
                case 'tickEvent': {
                    StrictObject.entries(
                        behaviorState.vehicleActivityMap
                    ).forEach(([vehicleId, activityId]) => {
                        if (!simulatedRegion.activities[activityId]) {
                            delete behaviorState.vehicleActivityMap[vehicleId];
                        }
                    });
                    break;
                }
                case 'vehicleArrivedEvent': {
                    const vehicle = draftState.vehicles[event.vehicleId];
                    if (
                        vehicle &&
                        isUnoccupied(vehicle, draftState.currentTime)
                    ) {
                        const activityId = nextUUID(draftState);
                        behaviorState.vehicleActivityMap[event.vehicleId] =
                            activityId;
                        vehicle.occupation = cloneDeepMutable(
                            UnloadingOccupation.create()
                        );
                        addActivity(
                            simulatedRegion,
                            UnloadVehicleActivityState.create(
                                activityId,
                                event.vehicleId,
                                event.arrivalTime,
                                behaviorState.unloadDelay
                            )
                        );
                    }
                    break;
                }
                case 'vehicleRemovedEvent': {
                    const activityId =
                        behaviorState.vehicleActivityMap[event.vehicleId];
                    if (activityId) {
                        terminateActivity(
                            draftState,
                            simulatedRegion,
                            activityId
                        );
                        delete behaviorState.vehicleActivityMap[
                            event.vehicleId
                        ];
                    }
                    break;
                }
                default:
                    break;
            }
        },
    };
