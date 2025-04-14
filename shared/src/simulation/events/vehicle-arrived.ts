import { IsInt, IsUUID, Min } from 'class-validator';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import { getCreate } from '../../models/utils/get-create.js';
import type { SimulationEvent } from './simulation-event.js';

export class VehicleArrivedEvent implements SimulationEvent {
    @IsValue('vehicleArrivedEvent')
    readonly type = 'vehicleArrivedEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly vehicleId: UUID;

    @IsInt()
    @Min(0)
    readonly arrivalTime: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(vehicleId: UUID, arrivalTime: number) {
        this.vehicleId = vehicleId;
        this.arrivalTime = arrivalTime;
    }

    static readonly create = getCreate(this);
}
