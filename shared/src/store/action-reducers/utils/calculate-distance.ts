import type { Position } from '../../../models/utils';

/**
 * @returns the distance between the two positions in meters.
 */
export function calculateDistance(a: Position, b: Position) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
