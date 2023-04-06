import { Type } from 'class-transformer';
import { IsInt, Min, ValidateNested } from 'class-validator';
import { VehicleResource } from '../../models/utils/vehicle-resource';
import { getCreate } from '../../models/utils/get-create';
import { IsValue } from '../../utils/validators/is-value';

export class ResourcePromise {
    @IsValue('resourcePromise')
    readonly type = 'resourcePromise';

    @IsInt()
    @Min(0)
    readonly promisedTime: number;

    @Type(() => VehicleResource)
    @ValidateNested()
    readonly resource: VehicleResource;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(promisedTime: number, resource: VehicleResource) {
        this.promisedTime = promisedTime;
        this.resource = resource;
    }

    static readonly create = getCreate(this);
}
