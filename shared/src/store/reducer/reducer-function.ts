import type { ExerciseAction } from '..';
import type { Mutable, ExerciseState } from '../..';

/**
 * A pure function that applies the action on the provided state.
 *
 * @throws {ReducerError} if the action is not applicable on the provided state
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
export type ReducerFunction<Action extends ExerciseAction> = (
    // These functions can only work with a mutable state object, because we expect them to be executed in immers produce context.
    draftState: Mutable<ExerciseState>,
    action: Action
) => Mutable<ExerciseState>;
