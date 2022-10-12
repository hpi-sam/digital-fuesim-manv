import { createReducer, on } from '@ngrx/store';
import type { ExerciseState } from 'digital-fuesim-manv-shared';
import { reduceExerciseState, ReducerError } from 'digital-fuesim-manv-shared';
import {
    applyServerAction,
    joinExercise,
    jumpToTime,
    leaveExercise,
    setExerciseState,
    startTimeTravel,
} from './application.actions';
import { ApplicationState } from './application.state';

export const applicationReducer = createReducer(
    new ApplicationState(),
    on(setExerciseState, (state, { exercise }) => ({
        ...state,
        exerciseState: exercise,
    })),
    on(applyServerAction, (state, { serverAction }) => {
        let newExerciseState: ExerciseState | undefined;
        try {
            newExerciseState = reduceExerciseState(
                state.exerciseState!,
                serverAction
            );
        } catch (error: any) {
            if (error instanceof ReducerError) {
                console.warn(
                    `Error while applying server action: ${error.message} \n
                            This is expected if an optimistic update has been applied.`
                );
                // If the reducer throws an error (which is expected due to optimistic updates), we don't change the state
                return state;
            }
            throw error;
        }
        return {
            ...state,
            exerciseState: newExerciseState,
        };
    }),
    on(startTimeTravel, (state, { initialExerciseState, endTime }) => ({
        ...state,
        exerciseState: initialExerciseState,
        exerciseStateMode: 'timeTravel',
        timeConstraints: {
            start: initialExerciseState.currentTime,
            current: initialExerciseState.currentTime,
            end: endTime,
        },
    })),
    on(jumpToTime, (state, { exerciseTime, exerciseStateAtTime }) => ({
        ...state,
        exerciseState: exerciseStateAtTime,
        timeConstraints: {
            ...state.timeConstraints!,
            current: exerciseTime,
        },
    })),
    on(
        joinExercise,
        (state, { ownClientId, exerciseId, clientName, exerciseState }) => ({
            ...state,
            exerciseState,
            exerciseStateMode: 'exercise',
            exerciseId,
            ownClientId,
            lastClientName: clientName,
        })
    ),
    on(leaveExercise, (state) => ({
        ...state,
        exerciseStateMode: undefined,
    }))
);
