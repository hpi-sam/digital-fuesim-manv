import {
    ExerciseAction,
    ValidationFailedError,
} from 'digital-fuesim-manv-shared';
import { ExerciseServer, ExerciseSocket } from '../../exercise-server';
import { clientMap } from '../client-map';

export const registerProposeActionHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    client.on('proposeAction', (action: ExerciseAction, callback): void => {
        // 1. validate json (see step 4)
        // 2. validate user permissions
        // 3. Get matching exercise wrapper (Done)
        const exerciseWrapper = clientMap.get(client)?.exercise;
        if (!exerciseWrapper) {
            callback({
                success: false,
                message: 'No exercise selected',
            });
            return;
        }
        // 4. apply action (+ save to timeline) (includes validation) (Done)
        try {
            exerciseWrapper.reduce(action);
        } catch (error) {
            if (error instanceof ValidationFailedError) {
                callback({
                    success: false,
                    message: `Invalid payload: ${error.errors}`,
                });
                return;
            }
            throw error;
        }
        // 5. send success response to emitting client
        // 6. determine affected clients
        // 7. send new state to all affected clients
        io.emit('performAction', action);
        callback({
            success: true,
        });
    });
};
