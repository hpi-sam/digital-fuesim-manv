import type { Position } from 'digital-fuesim-manv-shared';

export type WithPosition<T extends { position?: Position }> = T & {
    position: Position;
};
