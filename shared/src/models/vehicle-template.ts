import { IsNumber, IsString, IsUUID } from 'class-validator';
import type { CanCaterFor, PersonellType } from '..';
import { UUID, uuid, uuidValidationOptions } from '../utils';

export class VehicleTemplate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsString()
    public name: string;

    @IsString()
    public imageUrl: string;

    @IsNumber()
    public patientCapacity: number;

    public personnel: PersonellType[];

    public material: CanCaterFor;

    constructor(
        name: string,
        imageUrl: string,
        patientCapacity: number,
        personnel: PersonellType[],
        material: CanCaterFor
    ) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.patientCapacity = patientCapacity;
        this.personnel = personnel;
        this.material = material;
    }
}
