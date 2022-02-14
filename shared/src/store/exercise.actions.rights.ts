import type { ExerciseAction, Role } from '..';

/**
 * Assign a minimum role to each action.
 * It is participant < trainer < server
 */
export const exerciseRightsMap: {
    [Action in ExerciseAction as Action['type']]: Role | 'server';
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
    '[Viewport] Add viewport': 'trainer',
    '[Viewport] Remove viewport': 'trainer',
};
