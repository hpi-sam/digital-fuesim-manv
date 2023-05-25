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
    vehicle: Mutable<Vehicle>
) {
    if (
        vehicle.occupation.type === 'intermediateOccupation' &&
        vehicle.occupation.unoccupiedUntil < draftState.currentTime
    ) {
        changeOccupation(draftState, vehicle, NoOccupation.create());
    }

    return vehicle.occupation.type === 'noOccupation';
}

export function isUnoccupiedOrIntermediarilyOccupied(
    draftState: Mutable<ExerciseState>,
    vehicle: Mutable<Vehicle>
) {
    return (
        isUnoccupied(draftState, vehicle) ||
        vehicle.occupation.type === 'intermediateOccupation'
    );
}

export function changeOccupation(
    draftState: Mutable<ExerciseState>,
    vehicle: Mutable<Vehicle>,
    occupation: ExerciseOccupation
) {
    logVehicle(
        draftState,
        [createOccupationTag(draftState, occupation)],
        'Die Tätigkeit eines Fahrzeugs hat sich geändert.',
        vehicle.id
    );
    vehicle.occupation = cloneDeepMutable(occupation);
}
