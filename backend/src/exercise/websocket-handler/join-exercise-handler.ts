import type { Role } from 'digital-fuesim-manv-shared';
import type { ExerciseServer, ExerciseSocket } from '../../exercise-server';
import { clientMap } from '../client-map';

export const registerJoinExerciseHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    client.on(
        'joinExercise',
        (
            exerciseId: string,
            clientName: string,
            role: Role,
            callback
        ): void => {
            const clientId = clientMap
                .get(client)
                ?.joinExercise(exerciseId, clientName, role);
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
