import type { Client } from '../models';
import type { ExerciseState } from '../state';
import type { ExerciseAction } from './action-reducers';
import { getExerciseActionTypeDictionary } from './action-reducers/action-reducers';

const exerciseActionTypeDictionary = getExerciseActionTypeDictionary();

/**
 *
 * @param client The {@link Client} that proposed the {@link action}.
 * @param action The {@link ExerciseAction} that got proposed.
 * @param state The current {@link ExerciseState} before the {@link action} gets applied.
 * @returns true when the {@link action} can be applied, false otherwise.
 */
export function validatePermissions(
    client: Client,
    action: ExerciseAction,
    state: ExerciseState
) {
    const rights = exerciseActionTypeDictionary[action.type].rights;
    // Check role permissions
    if (
        (client.role === 'participant' && rights !== 'participant') ||
        rights === 'server'
    ) {
        return false;
    }
    // TODO: Validate e.g. only actions in own viewport
    return true;
}
