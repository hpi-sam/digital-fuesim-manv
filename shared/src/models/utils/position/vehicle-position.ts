import { IsUUID } from 'class-validator';
import type { UUID } from '../../../utils/index.js';
import { uuidValidationOptions } from '../../../utils/index.js';
import { IsValue } from '../../../utils/validators/index.js';
import { getCreate } from '../get-create.js';
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
} from './position-helpers.js';

export class VehiclePosition {
    /**
     * @deprecated Use {@link isInVehicle } or {@link isNotInVehicle} instead
     */
    @IsValue('vehicle')
    public readonly type = 'vehicle';

    /**
     * @deprecated Use {@link currentVehicleIdOf } instead
     */
    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(vehicleId: UUID) {
        this.vehicleId = vehicleId;
    }

    static readonly create = getCreate(this);
}
