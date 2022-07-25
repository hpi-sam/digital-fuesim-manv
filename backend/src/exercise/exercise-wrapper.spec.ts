import { jest } from '@jest/globals';
import { createTestEnvironment, sleep } from '../../test/utils';
import { clientMap } from './client-map';
import { ExerciseWrapper } from './exercise-wrapper';

describe('Exercise Wrapper', () => {
    const environment = createTestEnvironment();
    it('fails getting a role for the wrong id', () => {
        const exercise = ExerciseWrapper.create(
            '123456',
            '12345678',
            environment.databaseService
        );

        expect(() => exercise.getRoleFromUsedId('wrong id')).toThrow(
            RangeError
        );
    });

    it('does nothing adding a client that is not set up', async () => {
        const exercise = ExerciseWrapper.create(
            '123456',
            '12345678',
            environment.databaseService
        );
        // Use a websocket in order to have a ClientWrapper set up
        await environment.withWebsocket(async () => {
            // Sleep a bit to allow the socket to connect.
            await sleep(100);
            const client = clientMap.values().next().value;

            const applySpy = jest.spyOn(
                ExerciseWrapper.prototype,
                'applyAction'
            );
            exercise.addClient(client);

            expect(applySpy).not.toHaveBeenCalled();
        });
    });

    it('does nothing removing a client that is not joined', async () => {
        const exercise = await ExerciseWrapper.create(
            '123456',
            '12345678',
            environment.databaseService
        );
        // Use a websocket in order to have a ClientWrapper set up
        await environment.withWebsocket(async () => {
            const client = clientMap.values().next().value;

            const applySpy = jest.spyOn(
                ExerciseWrapper.prototype,
                'applyAction'
            );
            applySpy.mockClear();
            exercise.removeClient(client);

            expect(applySpy).not.toHaveBeenCalled();
        });
    });

    describe('Started Exercise', () => {
        let exercise: ExerciseWrapper | undefined;
        beforeEach(() => {
            exercise = ExerciseWrapper.create(
                '123456',
                '12345678',
                environment.databaseService
            );
            exercise.start();
        });
        afterEach(() => {
            exercise?.pause();
            exercise = undefined;
        });
        it('emits tick event in tick (repeated)', async () => {
            const applySpy = jest.spyOn(
                ExerciseWrapper.prototype,
                'applyAction'
            );
            const tickInterval = (exercise as any).tickInterval;

            applySpy.mockClear();
            await sleep(tickInterval * 2.01);
            expect(applySpy).toHaveBeenCalledTimes(2);
            let action = applySpy.mock.calls[0]![0];
            expect(action.type).toBe('[Exercise] Tick');
            action = applySpy.mock.calls[1]![0];
            expect(action.type).toBe('[Exercise] Tick');
        });
    });

    describe('Reactions to Actions', () => {
        it('calls start when matching action is sent', () => {
            const exercise = ExerciseWrapper.create(
                '123456',
                '12345678',
                environment.databaseService
            );

            const startMock = jest.spyOn(ExerciseWrapper.prototype, 'start');
            startMock.mockImplementation(() => ({}));

            exercise.applyAction(
                { type: '[Exercise] Start', timestamp: 0 },
                (exercise as any).emitterUUID
            );
            expect(startMock).toHaveBeenCalledTimes(1);
        });

        it('calls start when matching action is sent', () => {
            const exercise = ExerciseWrapper.create(
                '123456',
                '12345678',
                environment.databaseService
            );

            const pause = jest.spyOn(ExerciseWrapper.prototype, 'pause');
            pause.mockImplementation(() => ({}));

            exercise.applyAction(
                { type: '[Exercise] Pause', timestamp: 0 },
                (exercise as any).emitterUUID
            );
            expect(pause).toHaveBeenCalledTimes(1);
        });
    });
});
