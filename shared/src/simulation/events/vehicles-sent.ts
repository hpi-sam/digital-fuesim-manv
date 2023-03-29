import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { VehicleResource } from '../../models/utils/vehicle-resource';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class VehiclesSentEvent implements SimulationEvent {
    @IsValue('vehiclesSentEvent')
    readonly type = 'vehiclesSentEvent';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @Type(() => VehicleResource)
    readonly vehiclesSent!: VehicleResource;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(id: UUID, vehiclesSent: VehicleResource) {
        this.id = id;
        this.vehiclesSent = vehiclesSent;
    }

    static readonly create = getCreate(this);
}
