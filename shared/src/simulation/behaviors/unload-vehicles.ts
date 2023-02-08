import { IsUUID } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { VehicleArrivedEvent } from '../events/vehicle-arrived';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class UnloadVehiclesBehaviorState implements SimulationBehaviorState {
    @IsValue('UnloadVehiclesBehavior' as const)
    readonly type = 'UnloadVehiclesBehavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();
}

export const unloadVehiclesBehaviorRunner: SimulationBehavior<UnloadVehiclesBehaviorState> =
    {
        behaviorState: UnloadVehiclesBehaviorState,
        handle(draftState, event, behaviorState, simulatedRegion) {
            // TODO: build typing for type suggestion and inference of event properties
            if (event.type === 'VehicleArrivedEvent') {
                const arrivedEvent = event as VehicleArrivedEvent
                // TODO: add UnloadVehicleActivity to simulatedRegion
            }
        },
    };
