import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    ValidateNested,
    IsNumber,
    IsArray,
} from 'class-validator';
import { uuidValidationOptions, UUID, uuid } from '../utils';
import { IsLiteralUnion } from '../utils/validators';
import type { PersonnelType } from './utils';
import {
    ImageProperties,
    personnelTypeAllowedValues,
    getCreate,
} from './utils';
import type { MaterialType } from './utils/material-type';
import { materialTypeAllowedValues } from './utils/material-type';

export class VehicleTemplate {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsString()
    public readonly vehicleType: string;

    @IsString()
    public readonly name: string;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    @IsNumber()
    public readonly patientCapacity: number;

    @IsArray()
    @IsLiteralUnion(personnelTypeAllowedValues, {
        each: true,
    })
    public readonly personnel: readonly PersonnelType[];

    @IsArray()
    @IsLiteralUnion(materialTypeAllowedValues, {
        each: true,
    })
    public readonly materials: readonly MaterialType[];

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleType: string,
        name: string,
        image: ImageProperties,
        patientCapacity: number,
        personnel: readonly PersonnelType[],
        materials: readonly MaterialType[]
    ) {
        this.vehicleType = vehicleType;
        this.name = name;
        this.image = image;
        this.patientCapacity = patientCapacity;
        this.personnel = personnel;
        this.materials = materials;
    }

    static readonly create = getCreate(this);
}
