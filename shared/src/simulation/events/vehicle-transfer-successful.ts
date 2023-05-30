import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { VehicleResource } from '../../models/utils/rescue-resource';
import { getCreate } from '../../models/utils/get-create';
import type { SimulationEvent } from './simulation-event';

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
