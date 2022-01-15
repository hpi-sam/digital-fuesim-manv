import { ExerciseState, SocketResponse } from 'digital-fuesim-manv-shared';
import { createTestEnvironment, HttpMethod } from '../../test-utils';
import { ExerciseCreationResponse } from '../http-handler/api/exercise.spec';

describe('join exercise', () => {
    const environment = createTestEnvironment();

    const createExercise = async (): Promise<string> => {
        const response = await environment
            .httpRequest(HttpMethod.POST, '/api/exercise')
            .expect(201);

        return (response.body as ExerciseCreationResponse).exerciseId;
    };

    it('adds the joining client to the state', async () => {
        const exerciseId = await createExercise();

        environment.withWebsocket(async (clientSocket) => {
            const clientName = 'someRandomName';

            const joinExercise = await clientSocket.emit(
                'joinExercise',
                exerciseId,
                clientName,
                'trainer'
            );

            expect(joinExercise).toStrictEqual({ success: true });

            const getState = await clientSocket.emit<ExerciseState>('getState');

            expect(getState.success).toBe(true);

            if (!getState.success) {
                return;
            }
            expect(getState.payload).toBeDefined();
            expect(getState.payload.clients).toBeDefined();
            expect(
                Object.keys(getState.payload.clients).filter(
                    (client) =>
                        getState.payload.clients[client].name === clientName
                ).length
            ).toBe(1);
        });
    });

    it('ignores clients joining other exercises', async () => {
        const firstExerciseId = await createExercise();
        const secondExerciseId = await createExercise();

        environment.withWebsocket(async (firstClientSocket) => {
            const firstClientName = 'someRandomName';

            await firstClientSocket.emit(
                'joinExercise',
                firstExerciseId,
                firstClientName,
                'trainer'
            );

            environment.withWebsocket(async (secondClientSocket) => {
                const secondClientName = 'anotherRandomName';

                await secondClientSocket.emit(
                    'joinExercise',
                    secondExerciseId,
                    secondClientName,
                    'trainer'
                );

                const state = await firstClientSocket.emit<ExerciseState>(
                    'getState'
                );

                if (!state.success) {
                    return;
                }
                expect(
                    Object.keys(state.payload.clients).some(
                        (client) =>
                            state.payload.clients[client].name ===
                            secondClientName
                    )
                ).toBe(false);
            });
        });
    });

    it('sends a message to existing clients when another client is joining the exercises', async () => {
        const exerciseId = await createExercise();

        environment.withWebsocket(async (firstClientSocket) => {
            const firstClientName = 'someRandomName';

            firstClientSocket.spyOn('performAction');

            await firstClientSocket.emit(
                'joinExercise',
                exerciseId,
                firstClientName,
                'trainer'
            );

            environment.withWebsocket(async (secondClientSocket) => {
                const secondClientName = 'anotherRandomName';

                await secondClientSocket.emit(
                    'joinExercise',
                    exerciseId,
                    secondClientName,
                    'trainer'
                );

                expect(firstClientSocket.timesCalled('performAction')).toBe(1);
            });
        });
    });
});
