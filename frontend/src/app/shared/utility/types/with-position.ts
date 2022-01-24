import type { Position } from 'digital-fuesim-manv-shared';

export type WithPosition<T extends object> = T & { position: Position };
