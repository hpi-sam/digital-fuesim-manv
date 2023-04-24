import type { ExerciseOccupation } from './exercise-occupation';

export function isUnoccupiedImmutable(
    occupied: { occupation: ExerciseOccupation },
    currentTime: number
) {
    return (
        occupied.occupation.type === 'noOccupation' ||
        (occupied.occupation.type === 'intermediateOccupation' &&
            occupied.occupation.unoccupiedUntil < currentTime)
    );
}

export function isUnoccupiedOrIntermediarilyOccupiedImmutable(occupied: {
    occupation: ExerciseOccupation;
}) {
    return (
        occupied.occupation.type === 'noOccupation' ||
        occupied.occupation.type === 'intermediateOccupation'
    );
}
