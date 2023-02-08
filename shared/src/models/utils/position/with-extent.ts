import type { Size } from '../size';
import type { Position } from './position';

export interface WithExtent {
    readonly position: Position;
    readonly size: Size;
}
