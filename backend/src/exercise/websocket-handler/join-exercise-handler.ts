import type { UUID } from 'digital-fuesim-manv-shared';
import { ValidationErrorWrapper } from '../../utils/validation-error-wrapper';
import type { ExerciseServer, ExerciseSocket } from '../../exercise-server';
import { clientMap } from '../client-map';
import { secureOn } from './secure-on';

export const registerJoinExerciseHandler = (
    io: ExerciseServer,
    client: ExerciseSocket
) => {
    secureOn(
        client,
        'joinExercise',
        (exerciseId: string, clientName: string, callback): void => {
            // When this listener is registered the socket is in the map.
            const clientWrapper = clientMap.get(client)!;
            if (clientWrapper.exercise) {
                callback({
                    success: false,
                    message: 'The client has already joined an exercise',
                });
                return;
            }
            let clientId: UUID | undefined;
            try {
                clientId = clientMap
                    .get(client)
                    ?.joinExercise(exerciseId, clientName);
            } catch (e: unknown) {
                if (e instanceof ValidationErrorWrapper) {
                    callback({
                        success: false,
                        message: `Invalid payload: ${e.errors}`,
                    });
                    return;
                }
                throw e;
            }
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
