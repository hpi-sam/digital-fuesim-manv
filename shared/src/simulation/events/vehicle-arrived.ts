import { IsInt, IsUUID, Min } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class VehicleArrivedEvent implements SimulationEvent {
    @IsValue('vehicleArrivedEvent')
    readonly type = 'vehicleArrivedEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly vehicleId!: UUID;

    @IsInt()
    @Min(0)
    readonly arrivalTime!: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(vehicleId: UUID, arrivalTime: number) {
        this.vehicleId = vehicleId;
        this.arrivalTime = arrivalTime;
    }

    static readonly create = getCreate(this);
}
