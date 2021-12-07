import { UUID } from '../utils';
import { Position } from './utils';

export class Material {
    public id: UUID;

    /**
     * if undefined, is in vehicle with {@link vehicleId}
     */
    public position?: Position;

    public vehicleId: UUID;

    public assignedPatientIds: Set<UUID>;

    public canCaterFor: {
        red: number;
        yellow: number;
        green: number;
        logicalOperator: 'and' | 'or';
    };
}
