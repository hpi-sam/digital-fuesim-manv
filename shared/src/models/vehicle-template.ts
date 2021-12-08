import { Vehicle } from '.';
import { UUID, uuid } from '../utils';

export class VehicleTemplate {
    public id: UUID = uuid();

    constructor(
        public name: string,
        public vehicleProperties: Exclude<Vehicle, 'id'>
    ) {}
}
