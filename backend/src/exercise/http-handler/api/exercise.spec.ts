import { createTestEnvironment, HttpMethod } from '../../../test-utils';

export interface ExerciseCreationResponse {
    exerciseId: string;
}

describe('exercise', () => {
    const environment = createTestEnvironment();
    describe('POST /api/exercise', () => {
        it('returns an exercise id', async () => {
            const response = await environment.httpRequest('post', '/api/exercise')
                .expect(201);

            const exerciseCreationResponse =
                response.body as ExerciseCreationResponse;
            expect(exerciseCreationResponse.exerciseId).toBeDefined();
        });
    });
});
