import { Type } from 'class-transformer';
import {
    IsArray,
    IsNumber,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import type { CanCaterFor, PersonellType } from '..';
import { UUID, uuid, uuidValidationOptions } from '../utils';
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
    public personnel: PersonellType[];

    public material: CanCaterFor;

    constructor(
        name: string,
        image: ImageProperties,
        patientCapacity: number,
        personnel: PersonellType[],
        material: CanCaterFor
    ) {
        this.name = name;
        this.image = image;
        this.patientCapacity = patientCapacity;
        this.personnel = personnel;
        this.material = material;
    }
}
