import { UUID, uuid } from '../utils';
import { Position } from './utils';

export class TransferPoint {
    public id: UUID = uuid();

    constructor(
        public position: Position,
        public reachableTransferPoints: Record<
            UUID,
            {
                duration: number;
            }
        >,
        public internalName: string,
        public externalName: string
    ) {}
}
