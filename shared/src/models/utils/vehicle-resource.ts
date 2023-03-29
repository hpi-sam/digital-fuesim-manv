import { ValidateNested } from 'class-validator';
import { IsValue } from '../../utils/validators';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import { getCreate } from './get-create';

export class VehicleResource {
    @IsValue('vehicleResource' as const)
    public readonly type = 'vehicleResource';

    @ValidateNested()
    @IsResourceDescription()
    public readonly vehicleTypes!: { [key: string]: number };

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(vehicleTypes: { [key: string]: number }) {
        this.vehicleTypes = vehicleTypes;
    }

    static readonly create = getCreate(this);
}
