import type { Position, UUID } from 'digital-fuesim-manv-shared';

export interface TransferLine {
    readonly id: `${UUID}:${UUID}`;

    readonly startPosition: Position;
    readonly endPosition: Position;
    readonly duration: number;
}
