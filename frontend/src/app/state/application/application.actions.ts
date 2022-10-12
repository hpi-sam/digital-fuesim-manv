import { createAction } from '@ngrx/store';
import type {
    ExerciseAction,
    ExerciseState,
    UUID,
} from 'digital-fuesim-manv-shared';

/**
 * Applies the given action from the server to the exercise state in the frontend.
 */
export const startTimeTravel = createAction(
    '[Application] Start time travel',
    (initialExerciseState: ExerciseState, endTime: number) => ({
        initialExerciseState,
        endTime,
    })
);

export const jumpToTime = createAction(
    '[Application] Jump to time',
    (exerciseTime: number, exerciseStateAtTime: ExerciseState) => ({
        exerciseTime,
        exerciseStateAtTime,
    })
);

export const joinExercise = createAction(
    '[Application] Join exercise',
    (
        ownClientId: UUID,
        exerciseState: ExerciseState,
        exerciseId: UUID,
        clientName: string
    ) => ({
        ownClientId,
        exerciseState,
        exerciseId,
        clientName,
    })
);

export const leaveExercise = createAction('[Application] Leave exercise');

// The actions for the exercise
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
