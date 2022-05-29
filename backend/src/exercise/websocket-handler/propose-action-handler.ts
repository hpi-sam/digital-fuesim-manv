import type { ExerciseAction } from 'digital-fuesim-manv-shared';
import {
    ReducerError,
    validateExerciseAction,
    validatePermissions,
} from 'digital-fuesim-manv-shared';
import type { ExerciseServer, ExerciseSocket } from '../../exercise-server';
import { clientMap } from '../client-map';
import { secureOn } from './secure-on';

export const registerProposeActionHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    secureOn(
        client,
        'proposeAction',
        (action: ExerciseAction, callback): void => {
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
            // 4. apply & broadcast action (+ save to timeline)
            try {
                exerciseWrapper.applyAction(action, clientWrapper.client.id);
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
            // 5. send success response to emitting client
            callback({
                success: true,
            });
        }
    );
};
