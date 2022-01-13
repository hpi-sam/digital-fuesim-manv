import type { Server } from 'node:http';
import request from 'supertest';
import { main } from '../../..';

interface ExerciseCreationResponse {
    exerciseId: string;
}

exports = 1

describe('exercise', () => {
    let server: Server;
    beforeEach(() => {
        server = main();
    });
    describe('POST /api/exercise', () => {
        it('returns an exercise id', async () => {
            const response = await request(server)
                .post('/api/exercise')
                .expect(201);

            const exerciseCreationResponse =
                response.body as ExerciseCreationResponse;
            expect(exerciseCreationResponse.exerciseId).toBeDefined();
        });
    });
});
