export class PeriodicEventHandler {
    private currentState: 'paused' | 'running' = 'paused';

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
        this.currentState = 'running';
        this.tickHandler();
    }

    public pause() {
        this.currentState = 'paused';
    }

    private tickHandler() {
        setTimeout(() => {
            this.tick();
            if (this.currentState === 'running') {
                this.tickHandler();
            }
        }, this.interval);
    }
}
