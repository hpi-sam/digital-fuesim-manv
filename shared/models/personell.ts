import { UUID } from '../utils';
import { PersonellType, Position } from './utils';

export class Personell {
    public id: UUID;

    /**
     * if undefined, is in vehicle with {@link vehicleId}
     */
    public position?: Position;

    public vehicleId: UUID;

    public personellType: PersonellType;

    public assignedPatientIds: Set<UUID>
}
