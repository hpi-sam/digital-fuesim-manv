import { createReducer, on } from '@ngrx/store';
import {
    ExerciseState,
    reduceExerciseState,
    ReducerError,
} from 'digital-fuesim-manv-shared';
import { applyServerAction, setExerciseState } from './exercise.actions';

export const initialState = ExerciseState.create();

export const exerciseReducer = createReducer(
    initialState,
    on(setExerciseState, (state, { exercise }) => exercise),
    on(applyServerAction, (state, { serverAction }) => {
        let newState: ExerciseState | undefined;
        try {
            newState = reduceExerciseState(state!, serverAction);
        } catch (error: any) {
            if (error instanceof ReducerError) {
                console.warn(
                    `Error while applying server action: ${error.message} \n
                            This is expected if an optimistic update has been applied.`
                );
            } else {
                throw error;
            }
        }
        // If the reducer throws an error, we keep the current state
        return newState ?? state;
    })
);
