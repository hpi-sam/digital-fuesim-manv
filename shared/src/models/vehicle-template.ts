import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    ValidateNested,
    IsNumber,
    IsArray,
} from 'class-validator';
import type { PersonnelType } from '..';
import {
    CanCaterFor,
    getCreate,
    ImageProperties,
    UUID,
    uuid,
    uuidValidationOptions,
} from '..';

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
    @IsString()
    public readonly personnel: readonly PersonnelType[];

    @IsArray()
    @ValidateNested()
    @Type(() => CanCaterFor)
    public readonly materials: readonly CanCaterFor[];

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        name: string,
        image: ImageProperties,
        patientCapacity: number,
        personnel: readonly PersonnelType[],
        materials: readonly CanCaterFor[]
    ) {
        this.name = name;
        this.image = image;
        this.patientCapacity = patientCapacity;
        this.personnel = personnel;
        this.materials = materials;
    }

    static readonly create = getCreate(this);
}
