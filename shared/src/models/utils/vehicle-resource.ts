import type { Mutable } from '../../utils';
import { cloneDeepMutable } from '../../utils';
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

export function aggregateResources(
    resources: Mutable<VehicleResource>[]
): Mutable<VehicleResource> {
    return resources.reduce((total, current) => {
        Object.entries(current.vehicleCounts).forEach(([type, count]) => {
            if (!total.vehicleCounts[type]) total.vehicleCounts[type] = 0;
            total.vehicleCounts[type] += count;
        });
        return total;
    }, cloneDeepMutable(VehicleResource.create({})));
}

export function subtractResources(
    minuend: VehicleResource,
    subtrahend: VehicleResource
): Mutable<VehicleResource> {
    const result = cloneDeepMutable(minuend);
    Object.entries(subtrahend.vehicleCounts).forEach(([type, count]) => {
        if (!(type in result.vehicleCounts)) return;
        if (result.vehicleCounts[type]! <= count)
            delete result.vehicleCounts[type];
        result.vehicleCounts[type] -= count;
    });
    return result;
}
