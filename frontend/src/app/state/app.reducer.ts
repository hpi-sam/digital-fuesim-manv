import type { ActionReducerMap } from '@ngrx/store';
import type { ExerciseState } from 'digital-fuesim-manv-shared';
import { exerciseReducer } from 'digital-fuesim-manv-shared';
import type { AppState } from './app.state';

export const appReducers: ActionReducerMap<AppState> = {
    // TODO: I don't know why the `ActionReducer` type from the reducer is not working here
    exercise: exerciseReducer as (
        state: ExerciseState | undefined,
        action: any
    ) => ExerciseState,
};
