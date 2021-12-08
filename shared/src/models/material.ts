import { UUID, uuid } from '../utils';
import { Position } from './utils';

export class Material {
    public id: UUID = uuid();

    constructor(
        public vehicleId: UUID,
        public assignedPatientIds: Set<UUID>,
        public canCaterFor: {
            red: number;
            yellow: number;
            green: number;
            logicalOperator: 'and' | 'or';
        },
        /**
         * if undefined, is in vehicle with {@link vehicleId}
         */
        public position?: Position
    ) {}
}
