import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { getCreate } from '../../models/utils';
import { VehicleResource } from '../../models/utils/rescue-resource';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class VehiclesSentEvent implements SimulationEvent {
    @IsValue('vehiclesSentEvent')
    readonly type = 'vehiclesSentEvent';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @Type(() => VehicleResource)
    @ValidateNested()
    readonly vehiclesSent!: VehicleResource;

    @IsString()
    readonly key: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(id: UUID, vehiclesSent: VehicleResource, key: string) {
        this.id = id;
        this.vehiclesSent = vehiclesSent;
        this.key = key;
    }

    static readonly create = getCreate(this);
}
