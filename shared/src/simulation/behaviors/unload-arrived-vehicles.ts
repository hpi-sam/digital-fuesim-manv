import { IsInt, IsUUID, Min } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuid, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { UnloadVehicleActivityState } from '../activities/unload-vehicle';
import { addActivity } from '../utils/simulated-region';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class UnloadArrivedVehiclesBehaviorState
    implements SimulationBehaviorState
{
    @IsValue('unloadVehiclesBehavior' as const)
    readonly type = 'unloadVehiclesBehavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsInt()
    @Min(0)
    public readonly unloadDelay!: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(unloadDelay: number) {
        this.unloadDelay = unloadDelay;
    }

    static readonly create = getCreate(this);
}

export const unloadArrivingVehiclesBehavior: SimulationBehavior<UnloadArrivedVehiclesBehaviorState> =
    {
        behaviorState: UnloadArrivedVehiclesBehaviorState,
        handleEvent(draftState, event, behaviorState, simulatedRegion) {
            if (
                event.type === 'vehicleArrivedEvent' &&
                event.simulatedRegionId === simulatedRegion.id
            ) {
                addActivity(
                    simulatedRegion,
                    UnloadVehicleActivityState.create(
                        event.vehicleId,
                        event.arrivalTime,
                        behaviorState.unloadDelay
                    )
                );
            }
        },
    };
