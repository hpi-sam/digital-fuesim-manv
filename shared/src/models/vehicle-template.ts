import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    ValidateNested,
    IsNumber,
    IsArray,
} from 'class-validator';
import type { UUID } from '../utils/index.js';
import { uuidValidationOptions, uuid } from '../utils/index.js';
import { IsLiteralUnion, IsValue } from '../utils/validators/index.js';
import type { PersonnelType } from './utils/index.js';
import {
    ImageProperties,
    personnelTypeAllowedValues,
    getCreate,
} from './utils/index.js';
import type { MaterialType } from './utils/material-type.js';
import { materialTypeAllowedValues } from './utils/material-type.js';

export class VehicleTemplate {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('vehicleTemplate' as const)
    public readonly type = 'vehicleTemplate';

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
