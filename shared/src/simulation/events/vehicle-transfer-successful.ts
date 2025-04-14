import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import { VehicleResource } from '../../models/utils/rescue-resource.js';
import { getCreate } from '../../models/utils/get-create.js';
import type { SimulationEvent } from './simulation-event.js';

export class VehicleTransferSuccessfulEvent implements SimulationEvent {
    @IsValue('vehicleTransferSuccessfulEvent')
    readonly type = 'vehicleTransferSuccessfulEvent';

    @IsUUID(4, uuidValidationOptions)
    public readonly targetId: UUID;

    @IsString()
    public readonly key: string;

    @Type(() => VehicleResource)
    @ValidateNested()
    readonly vehiclesSent: VehicleResource;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(targetId: UUID, key: string, vehiclesSent: VehicleResource) {
        this.targetId = targetId;
        this.key = key;
        this.vehiclesSent = vehiclesSent;
    }

    static readonly create = getCreate(this);
}
