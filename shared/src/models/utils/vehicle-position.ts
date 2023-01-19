import type { UUID } from '../../utils';
import { getCreate } from './get-create';

export class VehiclePosition {
    public readonly type: 'Vehicle';

    public readonly vehicleId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(vehicleId: UUID) {
        this.type = 'Vehicle';
        this.vehicleId = vehicleId;
    }

    static readonly create = getCreate(this);
}
