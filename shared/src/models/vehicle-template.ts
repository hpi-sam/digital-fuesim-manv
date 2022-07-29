import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    ValidateNested,
    IsNumber,
    IsArray,
    IsOptional,
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
     * If an array, at position 0 it means zero patients are loaded
     * at position 1 one patient is loaded, etc.
     */
    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * If an array, at position 0 it means zero patients are loaded
     * at position 1 one patient is loaded, etc.
     */
    @IsArray()
    @ValidateNested()
    @Type(() => ImageProperties)
    @IsOptional()
    public readonly imagesPatientsLoaded?: ImageProperties[];

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
        materials: readonly CanCaterFor[],
        imagesPatientsLoaded?: ImageProperties[]
    ) {
        this.vehicleType = vehicleType;
        this.name = name;
        this.image = image;
        this.patientCapacity = patientCapacity;
        this.personnel = personnel;
        this.materials = materials;

        if (
            imagesPatientsLoaded !== undefined &&
            imagesPatientsLoaded.length + 1 !== patientCapacity
        )
            throw new ReducerError(
                `vehicle was tried to be created, but imagesPatientsLoaded.length is not equal to patientCapacity`
            );
        this.imagesPatientsLoaded = imagesPatientsLoaded;
    }

    static readonly create = getCreate(this);
}
