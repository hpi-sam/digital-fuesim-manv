import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    ValidateNested,
    IsNumber,
    IsArray,
    ArrayNotEmpty,
} from 'class-validator';
import { ReducerError } from '../store';
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

    /**
     * currentImage, loaded from images
     */
    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * If an array, at position 0 it means zero patients are loaded
     * at position 1 one patient is loaded, etc.
     */
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ImageProperties)
    public readonly images: ImageProperties[];

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
        images: ImageProperties[],
        patientCapacity: number,
        personnel: readonly PersonnelType[],
        materials: readonly CanCaterFor[]
    ) {
        if (images.length > patientCapacity + 1)
            throw new ReducerError(
                `vehicle was tried to be created, but images.length is greater than patientCapacity + 1`
            );

        this.vehicleType = vehicleType;
        this.name = name;
        this.images = images;
        this.image = images[0]!;
        this.patientCapacity = patientCapacity;
        this.personnel = personnel;
        this.materials = materials;
    }

    static readonly create = getCreate(this);
}
