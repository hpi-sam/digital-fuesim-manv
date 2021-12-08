import { UUID, uuid } from '../utils';
import { Position } from './utils';

export class TransferPoint {
    public id: UUID = uuid();

    constructor(
        public position: Position,
        public reachableTransferPoints: Set<{
            duration: number;
            targetId: UUID;
        }>,
        public internalName: string,
        public externalName: string
    ) {}
}
