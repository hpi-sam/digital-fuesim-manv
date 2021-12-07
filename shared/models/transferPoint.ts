import { UUID } from '../utils';
import { Position } from './utils';

export class TransferPoint {
    public id: UUID;

    public position: Position;

    public reachableTransferPoints: Set<{
        duration: number;
        targetId: UUID;
    }>;

    public internalName: string;

    public externalName: string;
}
