import { ValidateNested } from 'class-validator';
import { IsValue } from '../../utils/validators';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import { getCreate } from './get-create';

export class VehicleResource {
    @IsValue('vehicleResource' as const)
    public readonly type = 'vehicleResource';

    @IsResourceDescription()
    public readonly vehicleCounts!: { [key: string]: number };

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(vehicleCounts: { [key: string]: number }) {
        this.vehicleCounts = vehicleCounts;
    }

    static readonly create = getCreate(this);
}
