import { generateDummyPatient, uuid } from 'digital-fuesim-manv-shared';
import { createExercise, createTestEnvironment } from './utils';

describe('propose action', () => {
    const environment = createTestEnvironment();

    it('fails proposing an action when not joined an exercise', async () => {
        await environment.withWebsocket(async (socket) => {
            const proposeAction = await socket.emit('proposeAction', {
                type: '[Patient] Add patient',
                patient: generateDummyPatient(),
            });

            expect(proposeAction.success).toBe(false);
        });
    });

    it('fails proposing a syntactically invalid action', async () => {
        const exerciseIds = await createExercise(environment);

        await environment.withWebsocket(async (socket) => {
            const join = await socket.emit(
                'joinExercise',
                exerciseIds.trainerId,
                'Name'
            );

            expect(join.success).toBe(true);

            const propose = await socket.emit('proposeAction', {
                type: '[Patient] Remove patient',
                patientId: 'invalid-id',
            });

            expect(propose.success).toBe(false);
        });
    });

    it('fails proposing a semantically invalid action', async () => {
        const exerciseIds = await createExercise(environment);

        await environment.withWebsocket(async (socket) => {
            const join = await socket.emit(
                'joinExercise',
                exerciseIds.trainerId,
                'Name'
            );

            expect(join.success).toBe(true);

            const propose = await socket.emit('proposeAction', {
                type: '[Patient] Remove patient',
                patientId: uuid(),
            });

            expect(propose.success).toBe(false);
        });
    });

    it('succeeds proposing a valid action with sufficient rights', async () => {
        const exerciseIds = await createExercise(environment);

        await environment.withWebsocket(async (socket) => {
            const join = await socket.emit(
                'joinExercise',
                exerciseIds.trainerId,
                'Name'
            );

            expect(join.success).toBe(true);

            const propose = await socket.emit('proposeAction', {
                type: '[Patient] Add patient',
                patient: generateDummyPatient(),
            });

            expect(propose.success).toBe(true);
        });
    });

    it('fails proposing a valid action with unsufficient rights', async () => {
        const exerciseIds = await createExercise(environment);

        await environment.withWebsocket(async (socket) => {
            const join = await socket.emit(
                'joinExercise',
                exerciseIds.participantId,
                'Name'
            );

            expect(join.success).toBe(true);

            const propose = await socket.emit('proposeAction', {
                type: '[Patient] Add patient',
                patient: generateDummyPatient(),
            });

            expect(propose.success).toBe(false);
        });
    });
});
