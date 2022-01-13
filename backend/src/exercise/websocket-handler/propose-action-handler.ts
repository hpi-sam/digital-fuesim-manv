import type { ExerciseAction } from 'digital-fuesim-manv-shared';
import {
    ReducerError,
    validateExerciseAction,
} from 'digital-fuesim-manv-shared';
import type { ExerciseServer, ExerciseSocket } from '../../exercise-server';
import { clientMap } from '../client-map';

export const registerProposeActionHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    client.on('proposeAction', (action: ExerciseAction, callback): void => {
        // 1. validate json
        const errors = validateExerciseAction(action);
        if (errors.length > 0) {
            callback({
                success: false,
                message: `Invalid payload: ${errors}`,
            });
            return;
        }
        // 2. TODO: validate user permissions
        // 3. Get matching exercise wrapper
        const exerciseWrapper = clientMap.get(client)?.exercise;
        if (!exerciseWrapper) {
            callback({
                success: false,
                message: 'No exercise selected',
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
        io.emit('performAction', action);
        // 7. send success response to emitting client
        callback({
            success: true,
        });
    });
};
