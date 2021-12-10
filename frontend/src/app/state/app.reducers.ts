import { ActionReducerMap } from '@ngrx/store';
import { exerciseReducer, generateExercise } from 'digital-fuesim-manv-shared';
import { AppAction } from './app.actions';
import { AppState } from './app.state';

export const appReducers: ActionReducerMap<AppState, AppAction> = {
    exercise: (state, action) => {
        // It seems like Ngrxs expects the reducer function to return the first state if no state is provided
        if (!state) {
            return generateExercise();
        }
        return exerciseReducer(state, action);
    },
};
