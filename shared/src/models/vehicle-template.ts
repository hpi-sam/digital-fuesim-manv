import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Vehicle } from '.';
import { UUID, uuid, UUIDValidationOptions } from '../utils';

export class VehicleTemplate {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    @IsString()
    public name: string;

    @ValidateNested() // TODO: Does this work on Exclude?
    public vehicleProperties: Exclude<Vehicle, 'id'>;

    constructor(name: string, vehicleProperties: Exclude<Vehicle, 'id'>) {
        this.name = name;
        this.vehicleProperties = vehicleProperties;
    }
}
