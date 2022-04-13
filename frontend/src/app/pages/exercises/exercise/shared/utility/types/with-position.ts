import type { Position } from 'digital-fuesim-manv-shared';

export type WithPosition<T> = T & {
    position: Position;
};
