import { createReducer, on } from '@ngrx/store';
import type { ExerciseState } from 'digital-fuesim-manv-shared';
import {
    exerciseReducer as reduceExercise,
    generateExercise,
} from 'digital-fuesim-manv-shared';
import { applyServerAction, setExerciseState } from './exercise.actions';

export const initialState = generateExercise();

export const exerciseReducer = createReducer(
    initialState,
    on(setExerciseState, (state, { exercise }) => exercise),
    on(applyServerAction, (state, { serverAction }) => {
        let newState: ExerciseState | undefined;
        try {
            newState = reduceExercise(state!, serverAction);
        } catch (error: any) {
            console.warn(
                `Error while applying server action: ${error.message} \n
                        This is expected if an optimistic update has been applied.`
            );
        }
        // If the reducer throws an error, we keep the current state
        return newState ?? state;
    })
);
