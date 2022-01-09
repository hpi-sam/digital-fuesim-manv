import { createAction } from '@ngrx/store';
import type { ExerciseAction, ExerciseState } from 'digital-fuesim-manv-shared';

/**
 * Applies the given action from the server to the exercise state in the frontend.
 */
export const applyServerAction = createAction(
    '[Exercise] Apply server action',
    (serverAction: ExerciseAction) => ({ serverAction })
);
export const setExerciseState = createAction(
    '[Exercise] Set state',
    (exercise: ExerciseState) => ({ exercise })
);
