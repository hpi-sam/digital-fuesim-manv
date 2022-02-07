/**
 * Makes sure that a periodic {@link tick} function is executed every {@link interval}.
 */
export class PeriodicEventHandler {
    private currentTimeout?: NodeJS.Timeout;
    // Needed in addition to currentTimeout because tick is asynchronous and there is no timeout during its execution.
    private isPaused = false;
    /**
     *
     * @param tick A potentially synchronous or asynchronous long-running function.
     * @param interval in ms
     * It is guaranteed that at least as much time and tried via best effort
     * that exactly as much time as {@link interval} is between the calls of {@link tick}.
     */
    public constructor(
        private readonly tick: () => Promise<void>,
        private readonly interval: number
    ) {}
    public start() {
        this.isPaused = false;
        this.currentTimeout = setTimeout(() => {
            this.executeTick();
        }, this.interval);
    }
    public pause() {
        this.isPaused = true;
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = undefined;
        }
    }
    private async executeTick() {
        const lastTickStartTime = Date.now();
        await this.tick();
        if (this.isPaused) {
            return;
        }
        const lastTickDuration = Date.now() - lastTickStartTime;
        const timeToWait = Math.max(this.interval - lastTickDuration, 0);
        this.currentTimeout = setTimeout(() => {
            this.executeTick();
        }, timeToWait);
    }
}
