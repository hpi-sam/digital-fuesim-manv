import type { ExerciseAction } from 'digital-fuesim-manv-shared';
import {
    ReducerError,
    validateExerciseAction,
    validatePermissions,
} from 'digital-fuesim-manv-shared';
import type { ExerciseServer, ExerciseSocket } from '../../exercise-server';
import { clientMap } from '../client-map';

export const registerProposeActionHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    client.on('proposeAction', (action: ExerciseAction, callback): void => {
        const clientWrapper = clientMap.get(client);
        if (!clientWrapper) {
            // There is no client. Skip.
            console.error('Got an action from missing client');
            return;
        }
        // 1. validate json
        const errors = validateExerciseAction(action);
        if (errors.length > 0) {
            callback({
                success: false,
                message: `Invalid payload: ${errors}`,
            });
            return;
        }
        // If the action contains a timestamp, refresh it to the current server time.
        if ((action as any).timestamp !== undefined) {
            (action as any).timestamp = Date.now();
        }
        // 2. Get matching exercise wrapper & client wrapper
        const exerciseWrapper = clientWrapper.exercise;
        if (!exerciseWrapper) {
            callback({
                success: false,
                message: 'No exercise selected',
            });
            return;
        }
        if (!clientWrapper.client) {
            callback({
                success: false,
                message: 'No client selected',
            });
            return;
        }
        // 3. validate user permissions
        if (
            !validatePermissions(
                clientWrapper.client,
                action,
                exerciseWrapper.getStateSnapshot()
            )
        ) {
            callback({
                success: false,
                message: 'No sufficient rights',
            });
            return;
        }
        // 4. apply action (+ save to timeline)
        try {
            exerciseWrapper.reduce(action);
        } catch (error: any) {
            if (error instanceof ReducerError) {
                callback({
                    success: false,
                    message: error.message,
                });
                return;
            }
            throw error;
        }
        // 5. TODO: determine affected clients - don't send to clients in other exercises
        // 6. send new state to all affected clients
        exerciseWrapper.emitAction(action);
        // 7. send success response to emitting client
        callback({
            success: true,
        });
    });
};
