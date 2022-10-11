import type { ActionReducerMap } from '@ngrx/store';
import type { AppState } from './app.state';
import { applicationReducer } from './application/application.reducer';
import { exerciseReducer } from './exercise/exercise.reducer';

export const appReducers: ActionReducerMap<AppState> = {
    exercise: exerciseReducer,
    application: applicationReducer,
};
