import assert from 'node:assert';
import fs from 'node:fs';
import type { ExerciseState, Mutable } from 'digital-fuesim-manv-shared';
import { exerciseMap } from '../src/exercise/exercise-map';
import { UserReadableIdGenerator } from '../src/utils/user-readable-id-generator';
import type { ExerciseCreationResponse } from './utils';
import { createExercise, createTestEnvironment } from './utils';

describe('exercise', () => {
    const environment = createTestEnvironment();

    beforeEach(async () => {
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
            expect(exerciseCreationResponse.participantId).toBeDefined();
            expect(exerciseCreationResponse.trainerId).toBeDefined();
        });

        it('fails when no ids are left', async () => {
            for (let i = 0; i < 10_000; i++) {
                UserReadableIdGenerator.generateId();
            }
            await environment.httpRequest('post', '/api/exercise').expect(503);
        });

        it('imports an exercise correctly', async () => {
            // Load data
            const getJsonObjectFromFile = (path: string): object =>
                JSON.parse(fs.readFileSync(path, 'utf8'));
            const exampleExerciseExport = getJsonObjectFromFile(
                './test/data/example-exercise-export.json'
            );
            const exampleExerciseFinalState = getJsonObjectFromFile(
                './test/data/example-exercise-final-state.json'
            );
            const response = await environment
                .httpRequest('post', '/api/exercise')
                .send(exampleExerciseExport)
                .expect(201);

            const exerciseCreationResponse =
                response.body as ExerciseCreationResponse;
            await environment.withWebsocket(async (socket) => {
                const joinResponse = await socket.emit(
                    'joinExercise',
                    exerciseCreationResponse.trainerId,
                    'Test'
                );
                expect(joinResponse.success).toBe(true);

                const getStateResponse = await socket.emit('getState');
                expect(getStateResponse.success).toBe(true);
                assert(getStateResponse.success);

                const receivedState =
                    getStateResponse.payload as Mutable<ExerciseState>;
                const expectedState =
                    exampleExerciseFinalState as Mutable<ExerciseState>;
                receivedState.participantId = '123456';
                expectedState.participantId = '123456';
                expect(Object.keys(receivedState.clients).length).toBe(
                    Object.keys(expectedState.clients).length
                );
                receivedState.clients = {};
                expectedState.clients = {};

                expect(receivedState).toStrictEqual(expectedState);
            });
        }, 90_000);
    });

    describe('GET /api/exercise/:exerciseId', () => {
        it('succeeds returning true for participant id', async () => {
            const participantId = (await createExercise(environment))
                .participantId;
            await environment
                .httpRequest('get', `/api/exercise/${participantId}`)
                .expect(200);
        });

        it('succeeds returning true for trainer id', async () => {
            const trainerId = (await createExercise(environment)).trainerId;
            await environment
                .httpRequest('get', `/api/exercise/${trainerId}`)
                .expect(200);
        });

        it('succeeds returning false for not existing id', async () => {
            await environment
                .httpRequest('get', `/api/exercise/trainerId`)
                .expect(404);
        });
    });

    describe('DELETE /api/exercise/:exerciseId', () => {
        it('succeeds deleting an exercise', async () => {
            const exerciseId = (await createExercise(environment)).trainerId;
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

        it('fails deleting an exercise by its participant id', async () => {
            const exerciseId = (await createExercise(environment))
                .participantId;
            await environment
                .httpRequest('delete', `/api/exercise/${exerciseId}`)
                .expect(403);
        });

        it('disconnects clients of the removed exercise', async () => {
            const exerciseId = (await createExercise(environment)).trainerId;
            await environment.withWebsocket(async (socket) => {
                const joinExercise = await socket.emit(
                    'joinExercise',
                    exerciseId,
                    ''
                );

                expect(joinExercise.success).toBe(true);

                socket.spyOn('disconnect');

                await environment
                    .httpRequest('delete', `/api/exercise/${exerciseId}`)
                    .expect(204);

                expect(socket.getTimesCalled('disconnect')).toBe(1);
            });
        });
    });
});
