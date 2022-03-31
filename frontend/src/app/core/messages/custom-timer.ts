import { ReplaySubject } from 'rxjs';

/**
 * A timer that executes the callback after the given {@link time} (in ms) is over
 * with {@link pause()}/{@link start()} the timer can be paused and continued
 */
export class CustomTimer {
    // start is called in constructor
    private startIntervalDate!: number;
    private timeout?: ReturnType<typeof setTimeout>;
    private timeUntilCallbackIfNotPaused: number;

    private readonly _state$ = new ReplaySubject<'start' | 'stop'>(1);
    /**
     * Emits the current state of the timer (start/stop)
     */
    public readonly state$ = this._state$.asObservable();
    private isPaused = false;

    constructor(public readonly callback: () => void, public time: number) {
        this.timeUntilCallbackIfNotPaused = time;
        this.start();
    }

    /**
     * @returns the time left until the callback is called
     */
    public getTimeLeft() {
        if (this.isPaused) {
            return this.timeUntilCallbackIfNotPaused;
        }
        return Math.max(
            this.startIntervalDate +
                this.timeUntilCallbackIfNotPaused -
                Date.now(),
            0
        );
    }

    /**
     * Pauses the timer
     */
    public pause() {
        this.timeUntilCallbackIfNotPaused = this.getTimeLeft();
        this.isPaused = true;
        this.clearTimeout();
        this._state$.next('stop');
    }

    /**
     * Starts the timer
     */
    public start() {
        this.isPaused = false;
        this.startIntervalDate = Date.now();
        this.timeout = setTimeout(
            this.callback,
            this.timeUntilCallbackIfNotPaused
        );
        this._state$.next('start');
    }

    /**
     * Destroys the timer
     * Must be called to avoid memory leaks.
     */
    public destroy() {
        this._state$.complete();
        this.clearTimeout();
    }

    private clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }
}
