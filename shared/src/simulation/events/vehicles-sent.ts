import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import { VehicleResource } from '../../models/utils/rescue-resource.js';
import { IsValue } from '../../utils/validators/index.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import type { SimulationEvent } from './simulation-event.js';

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
