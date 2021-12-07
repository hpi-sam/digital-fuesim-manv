import { UUID } from '../utils';
import { Position } from './utils';

export class Vehicle {
    public id: UUID;

    /**
     * Exclusive-or to {@link transfer}
     */
    public position?: Position;

    /**
     * Exclusive-or to {@link position}
     */
    public transfer?: {
        timeRemaining: number;
        startTransferPointId: UUID;
        targetTransferPointId: UUID;
    };

    public personellIds: Set<UUID>;

    public materialId: UUID;

    public patientCapacity: number;

    public patientIds: Set<UUID>;

    public name: string;
}
