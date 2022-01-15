import request from 'supertest';
import { FuesimServer } from '../../../fuesim-server';

interface ExerciseCreationResponse {
    exerciseId: string;
}

describe('exercise', () => {
    let server: FuesimServer;
    beforeEach(() => {
        server = FuesimServer.create();
    });
    afterEach(() => {
        server.destroy();
    });
    describe('POST /api/exercise', () => {
        it('returns an exercise id', async () => {
            const response = await request(server.httpServer)
                .post('/api/exercise')
                .expect(201);

            const exerciseCreationResponse =
                response.body as ExerciseCreationResponse;
            expect(exerciseCreationResponse.exerciseId).toBeDefined();
        });
    });
});
