import type { UUID } from '../../utils';
import { getCreate } from './get-create';

export class VehiclePosition {
    public readonly type = 'vehicle';

    public readonly vehicleId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(vehicleId: UUID) {
        this.vehicleId = vehicleId;
    }

    static readonly create = getCreate(this);
}
