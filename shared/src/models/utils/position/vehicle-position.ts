import { IsUUID } from 'class-validator';
import { UUID } from '../../../utils';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import {
    // import needed to display @link Links in Comments
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isInVehicle,
    // import needed to display @link Links in Comments
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isNotInVehicle,
    // import needed to display @link Links in Comments
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentVehicleIdOf,
} from './position-helpers';

export class VehiclePosition {
    /**
     * @deprecated Use {@link isInVehicle } or {@link isNotInVehicle} instead
     */
    @IsValue('vehicle')
    public readonly type = 'vehicle';

    /**
     * @deprecated Use {@link currentVehicleIdOf } instead
     */
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
