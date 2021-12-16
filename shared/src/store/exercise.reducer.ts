import { ExerciseAction } from '.';
import { ExerciseState } from '..';
import { produce } from 'immer';

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
