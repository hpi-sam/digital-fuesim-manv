import type { Vehicle } from '../../vehicle';

export function isUnoccupiedImmutable(vehicle: Vehicle, currentTime: number) {
    return (
        vehicle.occupation.type === 'noOccupation' ||
        (vehicle.occupation.type === 'intermediateOccupation' &&
            vehicle.occupation.unoccupiedUntil < currentTime)
    );
}

export function isUnoccupiedOrIntermediarilyOccupiedImmutable(
    vehicle: Vehicle
) {
    return (
        vehicle.occupation.type === 'noOccupation' ||
        vehicle.occupation.type === 'intermediateOccupation'
    );
}
