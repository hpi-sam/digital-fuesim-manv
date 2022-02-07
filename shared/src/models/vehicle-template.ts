import { IsNumber, IsString, IsUUID } from 'class-validator';
import type { CanCaterFor, PersonellType } from '..';
import { UUID, uuid, uuidValidationOptions } from '../utils';

export class VehicleTemplate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsString()
    public name: string;

    @IsString()
    public imgUrl: string;

    @IsNumber()
    public patientCapacity: number;

    public personnel: PersonellType[];

    public material: CanCaterFor;

    constructor(
        name: string,
        imgUrl: string,
        patientCapacity: number,
        personnel: PersonellType[],
        material: CanCaterFor
    ) {
        this.name = name;
        this.imgUrl = imgUrl;
        this.patientCapacity = patientCapacity;
        this.personnel = personnel;
        this.material = material;
    }
}
