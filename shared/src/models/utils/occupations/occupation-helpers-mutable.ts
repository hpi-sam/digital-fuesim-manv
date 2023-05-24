import type { ExerciseState } from '../../../state';
import { logVehicle } from '../../../store/action-reducers/utils/log';
import type { Mutable } from '../../../utils';
import { cloneDeepMutable } from '../../../utils';
import type { Vehicle } from '../../vehicle';
import { createOccupationTag } from '../tag-helpers';
import type { ExerciseOccupation } from './exercise-occupation';
import { NoOccupation } from './no-occupation';

export function isUnoccupied(
    draftState: Mutable<ExerciseState>,
    occupied: Mutable<Vehicle>
) {
    if (
        occupied.occupation.type === 'intermediateOccupation' &&
        occupied.occupation.unoccupiedUntil < draftState.currentTime
    ) {
        changeOccupation(draftState, occupied, NoOccupation.create());
    }

    return occupied.occupation.type === 'noOccupation';
}

export function isUnoccupiedOrIntermediarilyOccupied(
    draftState: Mutable<ExerciseState>,
    occupied: Mutable<Vehicle>
) {
    return (
        isUnoccupied(draftState, occupied) ||
        occupied.occupation.type === 'intermediateOccupation'
    );
}

export function changeOccupation(
    draftState: Mutable<ExerciseState>,
    occupied: Mutable<Vehicle>,
    occupation: ExerciseOccupation
) {
    logVehicle(
        draftState,
        [createOccupationTag(draftState, occupation)],
        'Die Tätigkeit eines Fahrzeugs hat sich geändert.',
        occupied.id
    );
    occupied.occupation = cloneDeepMutable(occupation);
}
