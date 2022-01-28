import type { ExerciseServer, ExerciseSocket } from '../../exercise-server';
import { clientMap } from '../client-map';

export const registerJoinExerciseHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    client.on(
        'joinExercise',
        (exerciseId: string, clientName: string, callback): void => {
            const clientId = clientMap
                .get(client)
                ?.joinExercise(exerciseId, clientName);
            if (!clientId) {
                callback({
                    success: false,
                    message: 'The exercise does not exist',
                });
                return;
            }
            callback({
                success: true,
                payload: clientId,
            });
        }
    );
};
