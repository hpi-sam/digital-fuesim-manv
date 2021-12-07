import { Vehicle } from ".";
import { UUID } from "../utils";

export class VehicleTemplate {
    public id: UUID;

    public name: string;

    public vehicleProperties: Exclude<Vehicle, 'id'>
}
