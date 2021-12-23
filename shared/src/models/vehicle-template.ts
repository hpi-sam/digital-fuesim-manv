import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import type { Vehicle } from './vehicle';

export class VehicleTemplate {
    @IsUUID(4, uuidValidationOptions)
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
