export class PeriodicEventHandler {
    private currentState: 'paused' | 'running' = 'paused';

    private currentTick: Promise<void> | undefined = undefined;

    /**
     *
     * @param tick The function to be called.
     * @param interval The time between calls to {@link tick} in ms.
     */
    public constructor(
        private readonly tick: () => Promise<void>,
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
        setTimeout(async () => {
            if (this.currentTick !== undefined) {
                console.warn('Tick took too long! Skipping next tick.');
                if (this.currentState === 'running') {
                    this.tickHandler();
                }
                return;
            }
            this.currentTick = this.tick();
            if (this.currentState === 'running') {
                this.tickHandler();
            }
            await this.currentTick;
            this.currentTick = undefined;
        }, this.interval);
    }
}
