import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { getCreate } from '../../models/utils';
import { VehicleResource } from '../../models/utils/rescue-resource';
import { IsValue } from '../../utils/validators';
import { UUID, uuidValidationOptions } from '../../utils';
import type { SimulationEvent } from './simulation-event';

export class VehiclesSentEvent implements SimulationEvent {
    @IsValue('vehiclesSentEvent')
    readonly type = 'vehiclesSentEvent';

    @Type(() => VehicleResource)
    @ValidateNested()
    readonly vehiclesSent: VehicleResource;

    @IsUUID(4, uuidValidationOptions)
    readonly destinationTransferPointId: UUID;

    @IsOptional()
    @IsString()
    readonly key?: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehiclesSent: VehicleResource,
        transferPointDestinationId: UUID,
        key?: string
    ) {
        this.vehiclesSent = vehiclesSent;
        this.destinationTransferPointId = transferPointDestinationId;
        this.key = key;
    }

    static readonly create = getCreate(this);
}
