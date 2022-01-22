import assert from 'node:assert';
import { createExercise, createTestEnvironment } from './utils';

describe('disconnect socket', () => {
    const environment = createTestEnvironment();

    it('removes client from state on disconnect', async () => {
        const exerciseId = await createExercise(environment);

        const outerName = 'Name';
        const innerName = 'My Name';

        await environment.withWebsocket(async (outerSocket) => {
            await outerSocket.emit(
                'joinExercise',
                exerciseId,
                outerName,
                'participant'
            );

            let state = await outerSocket.emit('getState');
            expect(state.success).toBe(true);
            assert(state.success);
            const previousKeys = Object.keys(state.payload.clients);

            await environment.withWebsocket(async (innerSocket) => {
                await innerSocket.emit(
                    'joinExercise',
                    exerciseId,
                    innerName,
                    'participant'
                );
            });

            state = await outerSocket.emit('getState');
            expect(state.success).toBe(true);
            assert(state.success);
            const afterKeys = Object.keys(state.payload.clients);
            expect(afterKeys).toStrictEqual(previousKeys);
        });
    });
});
