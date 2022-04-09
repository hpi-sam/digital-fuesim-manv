import { Type } from 'class-transformer';
import {
    IsArray,
    IsNumber,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import type { PersonnelType } from './utils';
import { CanCaterFor } from './utils';
import { ImageProperties } from './utils/image-properties';

export class VehicleTemplate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsString()
    public name: string;

    @ValidateNested()
    @Type(() => ImageProperties)
    public image: ImageProperties;

    @IsNumber()
    public patientCapacity: number;

    @IsArray()
    public personnel: PersonnelType[];

    @ValidateNested()
    @Type(() => CanCaterFor)
    public material: CanCaterFor;

    private constructor(
        name: string,
        image: ImageProperties,
        patientCapacity: number,
        personnel: PersonnelType[],
        material: CanCaterFor
    ) {
        this.name = name;
        this.image = image;
        this.patientCapacity = patientCapacity;
        this.personnel = personnel;
        this.material = material;
    }

    static create(
        name: string,
        image: ImageProperties,
        patientCapacity: number,
        personnel: PersonnelType[],
        material: CanCaterFor
    ) {
        return {
            ...new VehicleTemplate(
                name,
                image,
                patientCapacity,
                personnel,
                material
            ),
        };
    }
}
