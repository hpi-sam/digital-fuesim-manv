import { IsInt, IsUUID, Min } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

// in ms (see state.currentTime)
// TODO: make configurable
const MAGIC_VALUE_UNLOAD = 5000;

export class UnloadVehicleActivityState implements SimulationActivityState {
    @IsValue('UnloadVehiclesActivity' as const)
    readonly type = 'UnloadVehiclesActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsUUID()
    readonly vehicleId!: UUID;

    @IsInt()
    @Min(0)
    readonly arrivalTime = 0;
}

export const unloadVehiclesActivity: SimulationActivity<UnloadVehicleActivityState> =
    {
        tick(draftState, simulatedRegion, activityState) {
            if (
                draftState.currentTime >=
                activityState.arrivalTime + MAGIC_VALUE_UNLOAD
            ) {
                // TODO: unload the vehicle in draftState
            }
            throw new Error('not implemented');
        },
    };
