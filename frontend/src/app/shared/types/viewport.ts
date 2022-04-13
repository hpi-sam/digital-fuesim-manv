import type { Immutable, UUID, Position } from 'digital-fuesim-manv-shared';

export type Viewport = Immutable<{
    id: `${UUID}:${UUID}`;

    name: string;
    bottomLeftCornerPosition: Position;
    topRightCornerPosition: Position;
}>;
