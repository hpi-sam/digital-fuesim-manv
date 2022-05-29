import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    ValidateNested,
    IsNumber,
    IsArray,
} from 'class-validator';
import { uuidValidationOptions, UUID, uuid } from '../utils';
import type { PersonnelType } from './utils';
import { CanCaterFor, ImageProperties, getCreate } from './utils';

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
    @IsString({ each: true })
    public readonly personnel: readonly PersonnelType[];

    @IsArray()
    @ValidateNested()
    @Type(() => CanCaterFor)
    public readonly materials: readonly CanCaterFor[];

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleType: string,
        name: string,
        image: ImageProperties,
        patientCapacity: number,
        personnel: readonly PersonnelType[],
        materials: readonly CanCaterFor[]
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
