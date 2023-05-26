import type { Type } from 'class-transformer';
import { StrictObject } from '../../utils';
import { IsValue } from '../../utils/validators';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import { getCreate } from './get-create';
import type { PersonnelType } from './personnel-type';
import { personnelTypeAllowedValues } from './personnel-type';
import { ResourceDescription } from './resource-description';

class RescueResource {
    public readonly type!: `${string}Resource`;
}

export class VehicleResource {
    @IsValue('vehicleResource' as const)
    public readonly type = 'vehicleResource';

    @IsResourceDescription()
    public readonly vehicleCounts: ResourceDescription;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(vehicleCounts: ResourceDescription) {
        this.vehicleCounts = vehicleCounts;
    }

    static readonly create = getCreate(this);
}

export class PersonnelResource {
    @IsValue('personnelResource' as const)
    public readonly type = 'personnelResource';

    @IsResourceDescription(personnelTypeAllowedValues)
    public readonly personnelCounts: ResourceDescription<PersonnelType>;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(personnelCounts?: ResourceDescription<PersonnelType>) {
        this.personnelCounts = personnelCounts ?? {
            gf: 0,
            notarzt: 0,
            notSan: 0,
            rettSan: 0,
            san: 0,
        };
    }

    static readonly create = getCreate(this);
}

export type ExerciseRescueResource = PersonnelResource | VehicleResource;

export const rescueResourceTypeOptions: Parameters<typeof Type> = [
    () => RescueResource,
    {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: [
                { name: 'vehicleResource', value: VehicleResource },
                { name: 'personnelResource', value: PersonnelResource },
            ],
        },
    },
];

export function isEmptyResource(resource: ExerciseRescueResource) {
    let resourceDescription: ResourceDescription;
    switch (resource.type) {
        case 'personnelResource':
            resourceDescription = resource.personnelCounts;
            break;
        case 'vehicleResource':
            resourceDescription = resource.vehicleCounts;
            break;
    }
    return StrictObject.values(resourceDescription).every(
        (count) => count === 0
    );
}
