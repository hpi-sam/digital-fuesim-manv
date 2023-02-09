import { IsInt, IsUUID, Min } from 'class-validator';
import { getCreate, isNotInSimulatedRegion } from '../../models/utils';
import { getElement } from '../../store/action-reducers/utils';
import { uuid, UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { removeActivity, unloadVehicle } from '../utils/simulated-region';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class UnloadVehicleActivityState implements SimulationActivityState {
    @IsValue('unloadVehiclesActivity' as const)
    public readonly type = 'unloadVehiclesActivity';

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
    constructor(vehicleId: UUID, startTime: number, duration: number) {
        this.vehicleId = vehicleId;
        this.startTime = startTime;
        this.duration = duration;
    }

    static readonly create = getCreate(this);
}

export const unloadVehicleActivity: SimulationActivity<UnloadVehicleActivityState> =
    {
        activityState: UnloadVehicleActivityState,
        tick(draftState, simulatedRegion, activityState) {
            const vehicle = getElement(draftState, 'vehicle', activityState.vehicleId)
            if (isNotInSimulatedRegion(vehicle)) {
                // The vehicle has left the region for some reason. Cancel unloading.
                removeActivity(simulatedRegion, activityState.id)
            } else if (
                draftState.currentTime >=
                activityState.startTime + activityState.duration
            ) {
                unloadVehicle(draftState, simulatedRegion, vehicle)
            }
        },
    };
