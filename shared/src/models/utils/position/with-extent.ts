import type { Size } from '../size.js';
import type { WithPosition } from './with-position.js';

export interface WithExtent extends WithPosition {
    readonly size: Size;
}
