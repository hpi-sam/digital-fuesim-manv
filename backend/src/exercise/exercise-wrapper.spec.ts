import { jest } from '@jest/globals';
import { createTestEnvironment, sleep } from '../../test/utils';
import { clientMap } from './client-map';
import { ExerciseWrapper } from './exercise-wrapper';

describe('exercise wrapper', () => {
    const environment = createTestEnvironment();
    it('fails getting a role for the wrong id', () => {
        const exercise = new ExerciseWrapper('participant', 'trainer');

        expect(() => exercise.getRoleFromUsedId('wrong id')).toThrow(
            RangeError
        );
    });

    it('does nothing adding a client that is not set up', async () => {
        const exercise = new ExerciseWrapper('participant', 'trainer');
        // Use a websocket in order to have a ClientWrapper set up
        await environment.withWebsocket(async () => {
            // Sleep a bit to allow the socket to connect.
            await sleep(100);
            const client = clientMap.values().next().value;

            const reduceSpy = jest.spyOn(
                ExerciseWrapper.prototype,
                'applyAction'
            );
            exercise.addClient(client);

            expect(reduceSpy).not.toHaveBeenCalled();
        });
    });

    it('does nothing removing a client that is not joined', async () => {
        const exercise = new ExerciseWrapper('participant', 'trainer');
        // Use a websocket in order to have a ClientWrapper set up
        await environment.withWebsocket(async () => {
            const client = clientMap.values().next().value;

            const reduceSpy = jest.spyOn(
                ExerciseWrapper.prototype,
                'applyAction'
            );
            reduceSpy.mockClear();
            exercise.removeClient(client);

            expect(reduceSpy).not.toHaveBeenCalled();
        });
    });
});
