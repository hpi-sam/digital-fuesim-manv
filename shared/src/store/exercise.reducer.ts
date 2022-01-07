import { produce } from 'immer';
import type { ExerciseState } from '..';
import type { Mutable } from '../utils/immutability';
import type { ExerciseAction } from '.';

/**
 * A pure reducer function that applies Actions on the provided state.
 * @param state The current state (immutable)
 * @param action The action to apply on the current state
 * @throws Error if the action is not applicable on the current state
 * @returns the new state
 */
export function exerciseReducer(
    state: ExerciseState,
    action: ExerciseAction
): ExerciseState {
    // use immer to convert mutating operations to immutable ones (https://immerjs.github.io/immer/produce)
    return produce(state, (draftState) =>
        // typescript doesn't narrow action and the reducer to the correct ones based on action.type
        exerciseReducerMap[action.type](draftState, action as any)
    );
}

const exerciseReducerMap: {
    [Action in ExerciseAction as Action['type']]: ReducerFunction<Action>;
} = {
    '[Viewport] Add viewport': (draftState, { viewport }) => {
        draftState.viewports[viewport.id] = viewport;
        return draftState;
    },
    '[Viewport] Remove viewport': (draftState, { viewportId }) => {
        if (!draftState.viewports[viewportId]) {
            throw Error(`Viewport with id ${viewportId} does not exist`);
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
            throw Error(`Patient with id ${patientId} does not exist`);
        }
        delete draftState.patients[patientId];
        return draftState;
    },
};

/**
 * A pure function that applies the action on the provided state.
 *
 * The function should throw an error if the action is not applicable on the provided state.
 *
 * It is expected to be used inside [immers produce](https://immerjs.github.io/immer/produce).
 *
 * [For expensive search operations, read from the original state, not the draft](https://immerjs.github.io/immer/performance#for-expensive-search-operations-read-from-the-original-state-not-the-draft)
 *
 * Example:
 * ```ts
 * // this is slow
 * draftState.anArray.find(item => item.id === action.id);
 * // this is fast
 * original(draftState).anArray.find(item => item.id === action.id);
 * ```
 *
 * You can also call other reducers from within a reducer function (don't create loops).
 *
 * Example:
 * ```ts
 * const anAction: ExerciseAction = { type: 'some action' };
 * exerciseReducerMap[anAction.type](draftState, anAction);
 * ```
 */
type ReducerFunction<Action extends ExerciseAction> = (
    // These functions can only work with a mutable state object, because we expect them to be executed in immers produce context.
    draftState: Mutable<ExerciseState>,
    action: Action
) => Mutable<ExerciseState>;
