import { setInterval } from 'node:timers';

export class PeriodicEventHandler {
    private currentTimer?: NodeJS.Timer = undefined;

    /**
     *
     * @param tick The function to be called.
     * @param interval The time between calls to {@link tick} in ms.
     */
    public constructor(
        private readonly tick: () => void,
        private readonly interval: number
    ) {}

    public start() {
        this.currentTimer = setInterval(this.tick, this.interval);
    }

    public pause() {
        if (this.currentTimer === undefined) return;
        clearInterval(this.currentTimer);
    }
}
