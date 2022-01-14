import type { Server } from 'node:http';
import request from 'supertest';
import { closeServers, main } from '../../..';

interface ExerciseCreationResponse {
    exerciseId: string;
}

describe('exercise', () => {
    let server: Server;
    beforeEach(() => {
        closeServers();
        server = main();
    });
    afterEach(() => {
        closeServers();
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
