import { ExerciseSocket, ExerciseServer } from '../../exercise-server';
import { clientMap } from '../client-map';

export const registerGetStateHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    client.on('getState', (callback): void => {
        const exercise = clientMap.get(client)?.exercise;
        if (!exercise) {
            callback({
                success: false,
                message: 'No exercise selected',
            });
            return;
        }
        callback({
            success: true,
            payload: exercise.getStateSnapshot(),
        });
    });
};
