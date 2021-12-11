import { ExerciseAction } from 'digital-fuesim-manv-shared';
import { ExerciseServer, ExerciseSocket } from '../../exercise-server';
import { clientMap } from '../client-map';

export const registerProposeActionHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    client.on('proposeAction', (action: ExerciseAction, callback): void => {
        // 1. validate json
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
        // 4. apply action (+ save to timeline) (Done)
        exerciseWrapper.reduce(action);
        // 5. send success response to emitting client
        // 6. determine affected clients
        // 7. send new state to all affected clients
        io.emit('performAction', action);
        callback({
            success: true,
        });
    });
};
