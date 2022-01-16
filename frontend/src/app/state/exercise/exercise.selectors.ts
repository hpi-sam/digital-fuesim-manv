import type { AppState } from '../app.state';

export const selectViewports = (state: AppState) => state.exercise.viewports;

export const selectPatients = (state: AppState) => state.exercise.patients;
