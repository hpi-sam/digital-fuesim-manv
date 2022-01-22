import assert from 'node:assert';
import { createExercise, createTestEnvironment } from './utils';

describe('join exercise', () => {
    const environment = createTestEnvironment();

    it('adds the joining client to the state', async () => {
        const exerciseId = await createExercise(environment);

        await environment.withWebsocket(async (clientSocket) => {
            const clientName = 'someRandomName';

            const joinExercise = await clientSocket.emit(
                'joinExercise',
                exerciseId,
                clientName,
                'trainer'
            );

            expect(joinExercise).toStrictEqual({ success: true });

            const getState = await clientSocket.emit('getState');

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
        const firstExerciseId = await createExercise(environment);
        const secondExerciseId = await createExercise(environment);

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

                const state = await firstClientSocket.emit('getState');

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
        const exerciseId = await createExercise(environment);

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
