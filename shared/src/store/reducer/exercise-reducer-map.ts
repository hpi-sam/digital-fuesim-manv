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
    '[Patient] Move patient': (draftState, { patientId, targetPosition }) => {
        const patient = draftState.patients[patientId];
        if (!patient) {
            throw new ReducerError(
                `Patient with id ${patientId} does not exist`
            );
        }
        patient.position = targetPosition;
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
    '[Vehicle] Move vehicle': (draftState, { vehicleId, targetPosition }) => {
        const vehicle = draftState.vehicles[vehicleId];
        if (!vehicle) {
            throw new ReducerError(
                `Vehicle with id ${vehicleId} does not exist`
            );
        }
        vehicle.position = targetPosition;
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
    '[Personell] Move personell': (
        draftState,
        { personellId, targetPosition }
    ) => {
        const personell = draftState.personell[personellId];
        if (!personell) {
            throw new ReducerError(
                `Personell with id ${personellId} does not exist`
            );
        }
        personell.position = targetPosition;
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
    '[Material] Move material': (
        draftState,
        { materialId, targetPosition }
    ) => {
        const material = draftState.materials[materialId];
        if (!material) {
            throw new ReducerError(
                `Material with id ${materialId} does not exist`
            );
        }
        material.position = targetPosition;
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
    '[Client] Add client': (draftState, { client }) => {
        draftState.clients[client.id] = client;
        return draftState;
    },
    '[Client] Remove client': (draftState, { clientId }) => {
        if (!draftState.clients[clientId]) {
            throw new ReducerError(`Client with id ${clientId} does not exist`);
        }
        delete draftState.clients[clientId];
        return draftState;
    },
    '[Client] Restrict to viewport': (draftState, { clientId, viewportId }) => {
        if (!draftState.clients[clientId]) {
            throw new ReducerError(`Client with id ${clientId} does not exist`);
        }
        if (viewportId === undefined) {
            draftState.clients[clientId].viewRestrictedToViewportId =
                viewportId;
            return draftState;
        }
        if (!draftState.viewports[viewportId]) {
            throw new ReducerError(
                `Viewport with id ${viewportId} does not exist`
            );
        }
        draftState.clients[clientId].viewRestrictedToViewportId = viewportId;
        return draftState;
    },
    '[Client] Set waitingroom': (
        draftState,
        { clientId, shouldBeInWaitingRoom }
    ) => {
        if (!draftState.clients[clientId]) {
            throw new ReducerError(`Client with id ${clientId} does not exist`);
        }
        draftState.clients[clientId].isInWaitingRoom = shouldBeInWaitingRoom;
        return draftState;
    },
};
