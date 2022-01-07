import { produce } from 'immer';
import type { ExerciseState } from '..';
import { exerciseReducerMap } from './exercise-reducer-map';
import type { ExerciseAction } from '.';

/**
 * A pure reducer function that applies the action on the state without mutating it.
 * @param state The current state (immutable)
 * @param action The action to apply on the current state
 * @throws Error if the action is not applicable on the current state
 * @returns the new state
 */
export function reduceExerciseState(
    state: ExerciseState,
    action: ExerciseAction
): ExerciseState {
    // use immer to convert mutating operations to immutable ones (https://immerjs.github.io/immer/produce)
    return produce(state, (draftState) =>
        // typescript doesn't narrow action and the reducer to the correct ones based on action.type
        exerciseReducerMap[action.type](draftState, action as any)
    );
}
