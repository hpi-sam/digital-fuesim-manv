import { IsUUID } from 'class-validator';
import { UUID } from '../../utils';
import { IsValue } from '../../utils/validators';
import { getCreate } from './get-create';

export class VehiclePosition {
    @IsValue('vehicle')
    public readonly type = 'vehicle';

    @IsUUID()
    public readonly vehicleId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(vehicleId: UUID) {
        this.vehicleId = vehicleId;
    }

    static readonly create = getCreate(this);
}
