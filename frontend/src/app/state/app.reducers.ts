import { ActionReducerMap } from '@ngrx/store';
import { exerciseReducer, generateExercise } from 'digital-fuesim-manv-shared';
import { AppAction } from './app.actions';
import { AppState } from './app.state';

export const appReducers: ActionReducerMap<AppState, AppAction> = {
    exercise: (state, action) => {
        // It seems like Ngrx expects the reducer function to return the first state if no state is provided
        if (!state) {
            return generateExercise();
        }
        if (action.type === '[Exercise] Set state') {
            return action.exercise;
        }
        return exerciseReducer(state, action);
    },
};
