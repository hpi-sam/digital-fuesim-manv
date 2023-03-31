import type { Type } from 'class-transformer';
import { IsValue } from '../../utils/validators';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import { getCreate } from './get-create';
import type { PersonnelType } from './personnel-type';

class RescueResource {
    public readonly type!: string;
}

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

export class PersonnelResource {
    @IsValue('personnelResource' as const)
    public readonly type = 'personnelResource';

    @IsResourceDescription()
    public readonly personnelCounts!: { [key in PersonnelType]: number };

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(personnelCounts: { [key in PersonnelType]: number }) {
        this.personnelCounts = personnelCounts;
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
