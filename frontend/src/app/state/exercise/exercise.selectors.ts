import { AppState } from '../app.state';

export const selectViewports = (state: AppState) => state.exercise.viewports;
