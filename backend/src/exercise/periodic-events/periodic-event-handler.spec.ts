import { sleep } from '../../../test/utils';
import { PeriodicEventHandler } from './periodic-event-handler';

describe('Periodic Event Handler', () => {
    it('correctly aborts async ticks', async () => {
        let startCallCounter = 0;
        let endCallCounter = 0;
        const tick = async () => {
            startCallCounter++;
            await sleep(10);
            endCallCounter++;
        };

        const tickInterval = 30;
        const tickHandler = new PeriodicEventHandler(tick, tickInterval);

        tickHandler.start();
        await sleep(tickInterval * 2.1);
        tickHandler.pause();

        // Wait to prevent test from finishing to early
        await sleep(tickInterval * 2);

        expect(startCallCounter).toBe(2);
        expect(endCallCounter).toBe(2);
    });
});
