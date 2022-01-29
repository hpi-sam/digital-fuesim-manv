import assert from 'node:assert';
import { Patient } from 'digital-fuesim-manv-shared';
import { createExercise, createTestEnvironment, sleep } from './utils';

describe('join exercise', () => {
    const environment = createTestEnvironment();

    it('adds the joining client to the state', async () => {
        const exerciseId = (await createExercise(environment)).trainerId;

        await environment.withWebsocket(async (clientSocket) => {
            const clientName = 'someRandomName';

            const joinExercise = await clientSocket.emit(
                'joinExercise',
                exerciseId,
                clientName
            );

            expect(joinExercise.success).toBe(true);
            assert(joinExercise.success);
            expect(joinExercise.payload).toBeDefined();

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
        const firstExerciseId = (await createExercise(environment)).trainerId;
        const secondExerciseId = (await createExercise(environment)).trainerId;

        await environment.withWebsocket(async (firstClientSocket) => {
            const firstClientName = 'someRandomName';

            await firstClientSocket.emit(
                'joinExercise',
                firstExerciseId,
                firstClientName
            );

            await environment.withWebsocket(async (secondClientSocket) => {
                const secondClientName = 'anotherRandomName';

                await secondClientSocket.emit(
                    'joinExercise',
                    secondExerciseId,
                    secondClientName
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
        const exerciseId = (await createExercise(environment)).trainerId;

        await environment.withWebsocket(async (firstClientSocket) => {
            const firstClientName = 'someRandomName';

            firstClientSocket.spyOn('performAction');

            await firstClientSocket.emit(
                'joinExercise',
                exerciseId,
                firstClientName
            );

            await environment.withWebsocket(async (secondClientSocket) => {
                const secondClientName = 'anotherRandomName';

                await secondClientSocket.emit(
                    'joinExercise',
                    exerciseId,
                    secondClientName
                );

                expect(firstClientSocket.getTimesCalled('performAction')).toBe(
                    1
                );
            });
        });
    });

    it('treats participant exercise the same as the trainer exercise', async () => {
        const exerciseIds = await createExercise(environment);

        await environment.withWebsocket(async (trainerSocket) => {
            const joinTrainer = await trainerSocket.emit(
                'joinExercise',
                exerciseIds.trainerId,
                'trainer'
            );

            expect(joinTrainer.success).toBe(true);

            await environment.withWebsocket(async (participantSocket) => {
                const joinParticipant = await participantSocket.emit(
                    'joinExercise',
                    exerciseIds.participantId,
                    'participant'
                );

                expect(joinParticipant.success).toBe(true);

                trainerSocket.spyOn('performAction');
                participantSocket.spyOn('performAction');

                const patient = new Patient(
                    {
                        hair: 'brown',
                        eyeColor: 'blue',
                        name: 'John Doe',
                        age: 42,
                    },
                    'green',
                    'green',
                    Date.now().toString()
                );

                // Proposing an action as the trainer
                const trainerPropose = await trainerSocket.emit(
                    'proposeAction',
                    {
                        type: '[Patient] Add patient',
                        patient,
                    }
                );

                expect(trainerPropose.success).toBe(true);

                await sleep(5);

                expect(trainerSocket.getTimesCalled('performAction')).toBe(1);
                expect(participantSocket.getTimesCalled('performAction')).toBe(
                    1
                );

                // Proposing an action as the participant
                const participantPropose = await participantSocket.emit(
                    'proposeAction',
                    {
                        type: '[Patient] Add patient',
                        patient,
                    }
                );

                expect(participantPropose.success).toBe(true);

                await sleep(5);

                expect(trainerSocket.getTimesCalled('performAction')).toBe(2);
                expect(participantSocket.getTimesCalled('performAction')).toBe(
                    2
                );
            });
        });
    });
});
