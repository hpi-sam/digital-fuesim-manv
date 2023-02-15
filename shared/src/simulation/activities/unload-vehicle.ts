import { IsInt, IsUUID, Min } from 'class-validator';
import { SimulatedRegion } from '../../models';
import { getCreate } from '../../models/utils';
import { uuid, UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { terminateActivity } from '../utils/simulated-region';
import { unloadVehicle } from '../utils/vehicle';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class UnloadVehicleActivityState implements SimulationActivityState {
    @IsValue('unloadVehicleActivity' as const)
    public readonly type = 'unloadVehicleActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

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
        vehicleId: UUID,
        startTime: number,
        duration: number,
        id?: UUID
    ) {
        this.vehicleId = vehicleId;
        this.startTime = startTime;
        this.duration = duration;
        if (id) this.id = id;
    }

    static readonly create = getCreate(this);
}

export const unloadVehicleActivity: SimulationActivity<UnloadVehicleActivityState> =
    {
        activityState: UnloadVehicleActivityState,
        tick(draftState, simulatedRegion, activityState) {
            const vehicle = draftState.vehicles[activityState.vehicleId];
            if (
                !vehicle ||
                !SimulatedRegion.isInSimulatedRegion(simulatedRegion, vehicle)
            ) {
                // The vehicle has left the region or was deleted for some reason. Cancel unloading.
                terminateActivity(
                    draftState,
                    simulatedRegion,
                    activityState.id
                );
            } else if (
                draftState.currentTime >=
                activityState.startTime + activityState.duration
            ) {
                unloadVehicle(draftState, simulatedRegion, vehicle);
                terminateActivity(
                    draftState,
                    simulatedRegion,
                    activityState.id
                );
            }
        },
    };
