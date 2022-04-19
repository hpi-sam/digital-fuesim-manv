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
import { CanCaterFor, getCreate } from './utils';
import { ImageProperties } from './utils/image-properties';

export class VehicleTemplate {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsString()
    public readonly name: string;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    @IsNumber()
    public readonly patientCapacity: number;

    @IsArray()
    public readonly personnel: readonly PersonnelType[];

    @ValidateNested()
    @Type(() => CanCaterFor)
    public readonly material: CanCaterFor[];

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        name: string,
        image: ImageProperties,
        patientCapacity: number,
        personnel: readonly PersonnelType[],
        material: CanCaterFor[]
    ) {
        this.name = name;
        this.image = image;
        this.patientCapacity = patientCapacity;
        this.personnel = personnel;
        this.material = material;
    }

    static readonly create = getCreate(this);
}
