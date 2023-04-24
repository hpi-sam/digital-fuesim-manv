import type { Mutable } from '../../../utils';
import { cloneDeepMutable } from '../../../utils';
import type { ExerciseOccupation } from './exercise-occupation';
import { NoOccupation } from './no-occupation';

export function isUnoccupied(
    occupied: Mutable<{ occupation: ExerciseOccupation }>,
    currentTime: number
) {
    if (
        occupied.occupation.type === 'intermediateOccupation' &&
        occupied.occupation.unoccupiedUntil < currentTime
    ) {
        occupied.occupation = cloneDeepMutable(NoOccupation.create());
    }

    return occupied.occupation.type === 'noOccupation';
}

export function isUnoccupiedOrIntermediarilyOccupied(
    occupied: Mutable<{ occupation: ExerciseOccupation }>,
    currentTime: number
) {
    return (
        isUnoccupied(occupied, currentTime) ||
        occupied.occupation.type === 'intermediateOccupation'
    );
}
