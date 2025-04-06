import type { ExerciseSocket, ExerciseServer } from '../../exercise-server.js';
import { clientMap } from '../client-map.js';
import { secureOn } from './secure-on.js';

export const registerGetStateHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    secureOn(client, 'getState', (callback): void => {
        const exercise = clientMap.get(client)?.exercise;
        if (!exercise) {
            callback({
                success: false,
                message: 'No exercise selected',
                expected: false,
            });
            return;
        }
        callback({
            success: true,
            payload: exercise.getStateSnapshot(),
        });
    });
};
