/* eslint-disable @typescript-eslint/no-throw-literal */
import type { ExerciseAction } from '..';
import type { ReducerFunction } from './reducer-function';
import { ReducerError } from '.';

/**
 * Here are all the reducers for the exercise state specified.
 * The key is the action type and the value is the reducer function.
 */
export const exerciseReducerMap: {
    [Action in ExerciseAction as Action['type']]: ReducerFunction<Action>;
} = {
    '[Viewport] Add viewport': (draftState, { viewport }) => {
        draftState.viewports[viewport.id] = viewport;
        return draftState;
    },
    '[Viewport] Remove viewport': (draftState, { viewportId }) => {
        if (!draftState.viewports[viewportId]) {
            throw new ReducerError(
                `Viewport with id ${viewportId} does not exist`
            );
        }
        delete draftState.viewports[viewportId];
        return draftState;
    },
    '[Patient] Add patient': (draftState, { patient }) => {
        draftState.patients[patient.id] = patient;
        return draftState;
    },
    '[Patient] Move patient': (draftState, { patientId, position }) => {
        const patient = draftState.patients[patientId];
        if (!patient) {
            throw new ReducerError(
                `Patient with id ${patientId} does not exist`
            );
        }
        patient.position = position;
        return draftState;
    },
    '[Patient] Remove patient': (draftState, { patientId }) => {
        if (!draftState.patients[patientId]) {
            throw new ReducerError(
                `Patient with id ${patientId} does not exist`
            );
        }
        delete draftState.patients[patientId];
        return draftState;
    },
    '[Vehicle] Add vehicle': (draftState, { vehicle }) => {
        draftState.vehicles[vehicle.id] = vehicle;
        return draftState;
    },
    '[Vehicle] Move vehicle': (draftState, { vehicleId, position }) => {
        const vehicle = draftState.vehicles[vehicleId];
        if (!vehicle) {
            throw new ReducerError(
                `Vehicle with id ${vehicleId} does not exist`
            );
        }
        vehicle.position = position;
        return draftState;
    },
    '[Vehicle] Remove vehicle': (draftState, { vehicleId }) => {
        if (!draftState.vehicles[vehicleId]) {
            throw new ReducerError(
                `Vehicle with id ${vehicleId} does not exist`
            );
        }
        delete draftState.vehicles[vehicleId];
        return draftState;
    },
    '[Personell] Add personell': (draftState, { personell }) => {
        draftState.personell[personell.id] = personell;
        return draftState;
    },
    '[Personell] Move personell': (draftState, { personellId, position }) => {
        const personell = draftState.personell[personellId];
        if (!personell) {
            throw new ReducerError(
                `Personell with id ${personellId} does not exist`
            );
        }
        personell.position = position;
        return draftState;
    },
    '[Personell] Remove personell': (draftState, { personellId }) => {
        if (!draftState.personell[personellId]) {
            throw new ReducerError(
                `Personell with id ${personellId} does not exist`
            );
        }
        delete draftState.personell[personellId];
        return draftState;
    },
    '[Material] Add material': (draftState, { material }) => {
        draftState.materials[material.id] = material;
        return draftState;
    },
    '[Material] Move material': (draftState, { materialId, position }) => {
        const material = draftState.materials[materialId];
        if (!material) {
            throw new ReducerError(
                `Material with id ${materialId} does not exist`
            );
        }
        material.position = position;
        return draftState;
    },
    '[Material] Remove material': (draftState, { materialId }) => {
        if (!draftState.materials[materialId]) {
            throw new ReducerError(
                `Material with id ${materialId} does not exist`
            );
        }
        delete draftState.materials[materialId];
        return draftState;
    },
};
