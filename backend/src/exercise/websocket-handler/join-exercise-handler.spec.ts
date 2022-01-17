import assert from 'node:assert';
import { ExerciseState } from 'digital-fuesim-manv-shared';
import { createTestEnvironment } from '../../test-utils';
import { ExerciseCreationResponse } from '../http-handler/api/exercise.spec';

describe('join exercise', () => {
    const environment = createTestEnvironment();

    const createExercise = async (): Promise<string> => {
        const response = await environment
            .httpRequest('post', '/api/exercise')
            .expect(201);

        return (response.body as ExerciseCreationResponse).exerciseId;
    };

    it('adds the joining client to the state', async () => {
        const exerciseId = await createExercise();

        await environment.withWebsocket(async (clientSocket) => {
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

            assert(getState.success);
            expect(getState.payload).toBeDefined();
            expect(getState.payload.clients).toBeDefined();
            expect(
                Object.values(getState.payload.clients).filter(
                    (client) => client.name === clientName
                ).length
            ).toBe(1);
        });
    });

    it('ignores clients joining other exercises', async () => {
        const firstExerciseId = await createExercise();
        const secondExerciseId = await createExercise();

        await environment.withWebsocket(async (firstClientSocket) => {
            const firstClientName = 'someRandomName';

            await firstClientSocket.emit(
                'joinExercise',
                firstExerciseId,
                firstClientName,
                'trainer'
            );

            await environment.withWebsocket(async (secondClientSocket) => {
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

                assert(state.success);
                expect(
                    Object.values(state.payload.clients).some(
                        (client) => client.name === secondClientName
                    )
                ).toBe(false);
            });
        });
    });

    it('sends a message to existing clients when another client is joining the exercises', async () => {
        const exerciseId = await createExercise();

        await environment.withWebsocket(async (firstClientSocket) => {
            const firstClientName = 'someRandomName';

            firstClientSocket.spyOn('performAction');

            await firstClientSocket.emit(
                'joinExercise',
                exerciseId,
                firstClientName,
                'trainer'
            );

            await environment.withWebsocket(async (secondClientSocket) => {
                const secondClientName = 'anotherRandomName';

                await secondClientSocket.emit(
                    'joinExercise',
                    exerciseId,
                    secondClientName,
                    'trainer'
                );

                expect(firstClientSocket.getTimesCalled('performAction')).toBe(
                    1
                );
            });
        });
    });
});
