import type { AppState } from '../app.state';

export const selectViewports = (state: AppState) => state.exercise.viewports;

export const selectPatients = (state: AppState) => state.exercise.patients;
export const selectVehicles = (state: AppState) => state.exercise.vehicles;
export const selectPersonell = (state: AppState) => state.exercise.personell;
export const selectMaterials = (state: AppState) => state.exercise.materials;
