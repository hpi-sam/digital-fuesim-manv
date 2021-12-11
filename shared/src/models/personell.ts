import { UUID, uuid, UUIDSet } from '../utils';
import { PersonellType, Position } from './utils';

export class Personell {
    public id: UUID = uuid();

    /**
     * if undefined, is in vehicle with {@link vehicleId}
     */
    public position?: Position;

    constructor(
        public vehicleId: UUID,
        public personellType: PersonellType,
        public assignedPatientIds: UUIDSet
    ) {}
}
