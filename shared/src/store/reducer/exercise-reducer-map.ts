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
    '[Patient] Remove patient': (draftState, { patientId }) => {
        if (!draftState.patients[patientId]) {
            throw new ReducerError(
                `Patient with id ${patientId} does not exist`
            );
        }
        delete draftState.patients[patientId];
        return draftState;
    },
    '[Client] Add client': (draftState, { client }) => {
        draftState.clients[client.id] = client;
        return draftState;
    },
    '[Client] Remove client': (draftState, { clientId }) => {
        if (!draftState.clients[clientId]) {
            throw new ReducerError(
                `Client with id ${clientId} does not exist`
            );
        }
        delete draftState.clients[clientId];
        return draftState;
    },
};
