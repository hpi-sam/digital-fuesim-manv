import { freeze, produce, setAutoFreeze } from 'immer';
import type { ExerciseState } from '../state';
import type { Mutable } from '../utils';
import { isDevelopment } from '../utils/is-development';
import type { ExerciseAction } from './action-reducers';
import { getExerciseActionTypeDictionary } from './action-reducers';

const exerciseActionTypeDictionary = getExerciseActionTypeDictionary();

// See https://immerjs.github.io/immer/freezing for more information.
setAutoFreeze(isDevelopment);

/**
 * A pure reducer function that applies the action on the state without mutating it.
 * @param state The current state (immutable)
 * @param action The action to apply on the current state
 * @throws {ReducerError} if the action is not applicable on the current state
 * @returns the new state
 */
export function reduceExerciseState(
    state: ExerciseState,
    action: ExerciseAction
): ExerciseState {
    // use immer to convert mutating operations to immutable ones (https://immerjs.github.io/immer/produce)
    return produce(state, (draftState) => applyAction(draftState, action));
}

/**
 * Applies the action on the state by mutating it.
 * @param state The current state (mutable)
 * @param action The action to apply on the current state
 * @throws {ReducerError} if the action is not applicable on the current state
 * @returns the new state
 */
export function applyAction(
    draftState: Mutable<ExerciseState>,
    action: ExerciseAction
) {
    if (isDevelopment) {
        // Make sure that the action isn't mutated in the reducer
        freeze(action, true);
    }
    return exerciseActionTypeDictionary[action.type].reducer(
        draftState,
        // typescript doesn't narrow action and the reducer to the correct ones based on action.type
        action as any
    );
}
