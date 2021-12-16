import {
    ExerciseAction,
    validateExerciseAction,
} from 'digital-fuesim-manv-shared';
import { ExerciseServer, ExerciseSocket } from '../../exercise-server';
import { clientMap } from '../client-map';

export const registerProposeActionHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    client.on('proposeAction', (action: ExerciseAction, callback): void => {
        // 1. validate json
        try {
            validateExerciseAction(action);
        } catch (error) {
            // TODO: how should you check for the type of thrown error?
            callback({
                success: false,
                message: `Invalid payload: ${(error as any)?.errors}`,
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
        // 4. apply action (+ save to timeline) (includes validation)
        exerciseWrapper.reduce(action);
        // 5. TODO: send success response to emitting client
        // 6. TODO: determine affected clients
        // 7. send new state to all affected clients
        io.emit('performAction', action);
        callback({
            success: true,
        });
    });
};
