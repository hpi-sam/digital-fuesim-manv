import type { ExerciseAction } from 'digital-fuesim-manv-shared';
import {
    ReducerError,
    ExpectedReducerError,
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
                    expected: false,
                });
                return;
            }
            // 2. Get matching exercise wrapper & client wrapper
            const exerciseWrapper = clientWrapper.exercise;
            if (!exerciseWrapper) {
                callback({
                    success: false,
                    message: 'No exercise selected',
                    expected: false,
                });
                return;
            }
            if (!clientWrapper.client) {
                callback({
                    success: false,
                    message: 'No client selected',
                    expected: false,
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
                    expected: false,
                });
                return;
            }
            // 4. apply & broadcast action (+ save to timeline)
            try {
                exerciseWrapper.applyAction(action, clientWrapper.client.id);
            } catch (error: any) {
                if (error instanceof ReducerError) {
                    if (error instanceof ExpectedReducerError) {
                        callback({
                            success: false,
                            message: error.message,
                            expected: true,
                        });
                    } else {
                        callback({
                            success: false,
                            message: error.message,
                            expected: false,
                        });
                    }
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
