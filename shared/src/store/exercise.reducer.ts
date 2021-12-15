import { ExerciseAction } from '.';
import { ExerciseState, Viewport } from '..';
import { produce } from 'immer';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ValidationFailedError } from '../errors';

/**
 * A pure reducer function that applies Actions on the provided state.
 * @param state The current state (immutable)
 * @param action The action to apply on the current state
 * @returns the new state
 */
export function exerciseReducer(state: ExerciseState, action: ExerciseAction) {
    // use immer to convert mutating operations to immutable ones (https://immerjs.github.io/immer/produce)
    return produce(state, (draftState) =>
        // typescript doesn't narrow action and the reducer to the correct ones based on action.type
        exerciseReducerMap[action.type](draftState!, action as any)
    );
}

const exerciseReducerMap: {
    [Action in ExerciseAction as Action['type']]: (
        state: ExerciseState,
        action: Action
    ) => ExerciseState;
} = {
    '[Viewport] Add viewport': (state, { viewport }) => {
        const viewportClass = plainToInstance(Viewport, viewport);
        const errors = validateSync(viewportClass);
        if (errors.length > 0) {
            throw new ValidationFailedError(errors);
        }
        state.viewports[viewport.id] = viewport;
        return state;
    },
    '[Viewport] Remove viewport': (state, { viewportId }) => {
        delete state.viewports[viewportId];
        return state;
    },
    '[Patient] Add patient': (state, { patient }) => {
        state.patients[patient.id] = patient;
        return state;
    },
    '[Patient] Remove patient': (state, { patientId }) => {
        delete state.patients[patientId];
        return state;
    },
};
