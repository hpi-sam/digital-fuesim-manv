import type { ExerciseServer, ExerciseSocket } from '../../exercise-server';
import { clientMap } from '../client-map';

export const registerJoinExerciseHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    client.on('joinExercise', (exerciseId: string, callback): void => {
        console.log(exerciseId);
        if (!clientMap.get(client)?.setExercise(exerciseId)) {
            callback({
                success: false,
                message: 'The exercise does not exist',
            });
        }
        callback({
            success: true,
        });
    });
};
