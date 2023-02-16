import { IsInt, IsUUID, Min } from 'class-validator';
import { SimulatedRegion } from '../../models';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { unloadVehicle } from '../utils/vehicle';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class UnloadVehicleActivityState implements SimulationActivityState {
    @IsValue('unloadVehicleActivity' as const)
    public readonly type = 'unloadVehicleActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;

    @IsInt()
    @Min(0)
    public readonly startTime!: number;

    @IsInt()
    @Min(0)
    public readonly duration!: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        vehicleId: UUID,
        startTime: number,
        duration: number
    ) {
        this.vehicleId = vehicleId;
        this.startTime = startTime;
        this.duration = duration;
        this.id = id;
    }

    static readonly create = getCreate(this);
}

// Because this activity relies on a cancel condition, we cannot model it as a DelayEventActivity
export const unloadVehicleActivity: SimulationActivity<UnloadVehicleActivityState> =
    {
        activityState: UnloadVehicleActivityState,
        tick(
            draftState,
            simulatedRegion,
            activityState,
            _tickInterval,
            terminate
        ) {
            const vehicle = draftState.vehicles[activityState.vehicleId];
            if (
                !vehicle ||
                !SimulatedRegion.isInSimulatedRegion(simulatedRegion, vehicle)
            ) {
                // The vehicle has left the region or was deleted for some reason. Cancel unloading.
                terminate();
            } else if (
                draftState.currentTime >=
                activityState.startTime + activityState.duration
            ) {
                unloadVehicle(draftState, simulatedRegion, vehicle);
                terminate();
            }
        },
    };
