import type { Role } from '../models/utils';
import type { ExerciseState } from '../state';
import type { Constructor, Mutable } from '../utils';

export interface ActionReducer<A extends Action = Action> {
    readonly action: Constructor<A>;
    readonly reducer: ReducerFunction<InstanceType<this['action']>>;
    readonly rights: Role | 'server';
}

/**
 *  An action is an interface for immutable JSON objects used to update the store in the frontend and
 *  are send to the backend to apply the changes there too.
 *
 *  The classes themself should only be used to validate the JSON objects in the backend, not to create them.
 *  Instead you should use the classes solely as interfaces and instantiate them like this:
 *  ```ts
 *  const action: RemoveViewport = {
 *      type: '[Viewport] Remove viewport',
 *      viewportId: 'some-uuid',
 *  };
 *  ```
 *
 *  The constructor of an Action must be callable without any arguments, to allow getting their type-value to
 *  validate the action objects in the backend.
 *  The properties of an Action must be decorated with class-validator decorators to allow validating them in the backend.
 */
export interface Action {
    readonly type: `[${string}] ${string}`;
    /**
     * This timestamp will be refreshed by the server when receiving the action.
     * Only use a field with this name in case you want this behavior.
     */
    timestamp?: number;
}

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
type ReducerFunction<A extends Action> = (
    // These functions can only work with a mutable state object, because we expect them to be executed in immers produce context.
    draftState: Mutable<ExerciseState>,
    action: A
) => Mutable<ExerciseState>;
