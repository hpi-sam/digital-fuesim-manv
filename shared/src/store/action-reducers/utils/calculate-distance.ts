import type { MapCoordinates } from '../../../models/utils';

/**
 * @returns the distance between the two positions in meters.
 */
export function calculateDistance(a: MapCoordinates, b: MapCoordinates) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
