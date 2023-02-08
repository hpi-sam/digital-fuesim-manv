import type { Size } from '../size';
import type { WithPosition } from './with-position';

export interface WithExtent extends WithPosition {
    readonly size: Size;
}
