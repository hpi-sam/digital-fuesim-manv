import { exerciseMap } from '../src/exercise/exercise-map';
import { UserReadableIdGenerator } from '../src/utils/user-readable-id-generator';
import { createExercise, createTestEnvironment } from './utils';

export interface ExerciseCreationResponse {
    exerciseId: string;
}

describe('exercise', () => {
    const environment = createTestEnvironment();

    beforeEach(() => {
        UserReadableIdGenerator.freeAll();
        exerciseMap.clear();
    });
    describe('POST /api/exercise', () => {
        it('returns an exercise id', async () => {
            const response = await environment
                .httpRequest('post', '/api/exercise')
                .expect(201);

            const exerciseCreationResponse =
                response.body as ExerciseCreationResponse;
            expect(exerciseCreationResponse.exerciseId).toBeDefined();
        });

        it('fails when no ids are left', async () => {
            for (let i = 0; i < 10_000; i++) {
                await environment
                    .httpRequest('post', '/api/exercise')
                    .expect(201);
            }
            await environment.httpRequest('post', '/api/exercise').expect(503);
        }, 10000);
    });

    describe('DELETE /api/exercise/:exerciseId', () => {
        it('succeeds deleting an exercise', async () => {
            const exerciseId = await createExercise(environment);
            await environment
                .httpRequest('delete', `/api/exercise/${exerciseId}`)
                .expect(204);

            expect(exerciseMap.size).toBe(0);
        });

        it('fails deleting a not existing exercise', async () => {
            await environment
                .httpRequest('delete', '/api/exercise/anyNumber')
                .expect(404);
        });

        it('disconnects clients of the removed exercise', async () => {
            const exerciseId = await createExercise(environment);
            await environment.withWebsocket(async (socket) => {
                const joinExercise = await socket.emit(
                    'joinExercise',
                    exerciseId,
                    '',
                    'participant'
                );

                expect(joinExercise.success).toBe(true);

                // TODO: Further specify types in utils in order to remove as any
                socket.spyOn('disconnect' as any);

                await environment
                    .httpRequest('delete', `/api/exercise/${exerciseId}`)
                    .expect(204);

                expect(socket.getTimesCalled('disconnect' as any)).toBe(1);
            });
        });
    });
});
