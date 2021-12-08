import { UUID, uuid } from '../utils';
import { Position } from './utils';

export class Vehicle {
    public id: UUID = uuid();

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

    public personellIds: Set<UUID> = new Set();
    public patientIds: Set<UUID> = new Set();

    constructor(
        public materialId: UUID,
        public patientCapacity: number,
        public name: string
    ) {}
}
