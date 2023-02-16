import { IsInt, IsUUID, Min } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuid, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { UnloadVehicleActivityState } from '../activities/unload-vehicle';
import { nextUUID } from '../utils/randomness';
import { addActivity } from '../utils/simulated-region';
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

export const unloadArrivingVehiclesBehavior: SimulationBehavior<UnloadArrivingVehiclesBehaviorState> =
    {
        behaviorState: UnloadArrivingVehiclesBehaviorState,
        handleEvent(draftState, simulatedRegion, behaviorState, event) {
            if (event.type === 'vehicleArrivedEvent') {
                addActivity(
                    simulatedRegion,
                    UnloadVehicleActivityState.create(
                        nextUUID(draftState),
                        event.vehicleId,
                        event.arrivalTime,
                        behaviorState.unloadDelay
                    )
                );
            }
        },
    };
