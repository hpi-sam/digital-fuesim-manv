import type { Client, ExerciseAction, ExerciseState, Role } from '..';

/**
 * Assign a minimum role to each action.
 * It is participant < trainer < server
 */
const exerciseRightsMap: {
    [ActionType in ExerciseAction['type']]: Role | 'server';
} = {
    '[Client] Add client': 'server',
    '[Client] Remove client': 'server',
    '[Client] Restrict to viewport': 'trainer',
    '[Client] Set waitingroom': 'trainer',
    '[Exercise] Pause': 'trainer',
    '[Exercise] Set Participant Id': 'server',
    '[Exercise] Start': 'trainer',
    '[Material] Move material': 'participant',
    '[Patient] Add patient': 'trainer',
    '[Patient] Move patient': 'participant',
    '[Patient] Remove patient': 'trainer',
    '[Personell] Move personell': 'participant',
    '[Vehicle] Add vehicle': 'trainer',
    '[Vehicle] Move vehicle': 'participant',
    '[Vehicle] Remove vehicle': 'trainer',
    '[Vehicle] Unload vehicle': 'participant',
    '[Viewport] Add viewport': 'trainer',
    '[Viewport] Remove viewport': 'trainer',
};

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
    // Check role permissions
    if (
        (client.role === 'participant' &&
            exerciseRightsMap[action.type] !== 'participant') ||
        exerciseRightsMap[action.type] === 'server'
    ) {
        return false;
    }
    // TODO: Validate e.g. only actions in own viewport
    return true;
}
