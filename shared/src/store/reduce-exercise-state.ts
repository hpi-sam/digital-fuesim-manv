import { freeze } from 'immer';
import { create } from 'mutative';
import type { ExerciseState } from '../state';
import type { Mutable } from '../utils';
import type { ExerciseAction } from './action-reducers';
import { getExerciseActionTypeDictionary } from './action-reducers';

const exerciseActionTypeDictionary = getExerciseActionTypeDictionary();

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
    // Make sure that the state isn't mutated in the reducer (short circuits if the state is already frozen)
    freeze(state, true);
    // use immer to convert mutating operations to immutable ones (https://immerjs.github.io/immer/produce)
    // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
    return create(
        state,
        (draftState) => {
            // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
            applyAction(draftState, action);
        },
        {
            enableAutoFreeze: true,
        }
    );
}

/**
 * Applies the action on the state by mutating it.
 * @param draftState The current state (mutable)
 * @param action The action to apply on the current state
 * @throws {ReducerError} if the action is not applicable on the current state
 * @returns the new state
 */
export function applyAction(
    draftState: Mutable<ExerciseState>,
    action: ExerciseAction
) {
    // Make sure that the action isn't mutated in the reducer (short circuits if the action is already frozen)
    freeze(action, true);
    return exerciseActionTypeDictionary[action.type].reducer(
        draftState,
        // typescript doesn't narrow action and the reducer to the correct ones based on action.type
        action as any
    );
}

/**
 * @param actions all the actions that were applied to the {@link initialState} to get to the present state
 * @returns the state after applying all the actions
 */
export function applyAllActions(
    initialState: ExerciseState,
    actions: readonly ExerciseAction[]
): ExerciseState {
    // TODO: find a heuristic for whether using produce or deepCloning it
    // Default is produce
    // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
    return create(
        initialState,
        (draftState) => {
            for (const action of actions) {
                // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
                applyAction(draftState, action);
            }
        },
        {
            enableAutoFreeze: true,
        }
    );
}
