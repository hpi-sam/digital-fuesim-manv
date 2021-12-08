import { UUID, uuid } from '../utils';
import { PatientStatus, Position } from './utils';

export class Patient {
    public id: UUID = uuid();

    constructor(
        // TODO: Specify patient data (e.g. injuries, name, etc.)
        public personalInformation: any,
        public visibleStatus: PatientStatus | null,
        public realStatus: PatientStatus,
        public nextPhaseChange: Date
    ) {}

    /**
     * Exclusive-or to {@link vehicleId}
     */
    public position?: Position;

    /**
     * Exclusive-or to {@link position}
     */
    public vehicleId?: UUID;
}
