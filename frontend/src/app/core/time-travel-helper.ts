import type {
    ExerciseState,
    ExerciseTimeline,
} from 'digital-fuesim-manv-shared';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { TimeJumpHelper } from './time-jump-helper';

export class TimeTravelHelper {
    constructor(
        /**
         * Gets the state of the exercise at the real present time
         */
        private readonly getPresentState: () => ExerciseState,
        private readonly setState: (state: ExerciseState) => void,
        private readonly getTimeLine: () => Promise<ExerciseTimeline>
    ) {}

    public timeConstraints?: TimeConstraints;
    public readonly timeConstraints$ = new BehaviorSubject<
        TimeConstraints | undefined
    >(this.timeConstraints);
    setTimeConstraints(timeConstraints: TimeConstraints | undefined) {
        this.timeConstraints = timeConstraints;
        this.timeConstraints$.next(this.timeConstraints);
    }

    public get isTimeTraveling(): boolean {
        return !!this.timeConstraints;
    }
    public readonly isTimeTraveling$ = this.timeConstraints$.pipe(
        map(() => this.isTimeTraveling),
        distinctUntilChanged()
    );

    private timeJumpHelper?: TimeJumpHelper;

    public async startTimeTravel() {
        const exerciseTimeLine = await this.getExerciseTimeline();
        const presentState = this.getPresentState();
        // Travel to the start of the exercise
        this.setTimeConstraints({
            start: exerciseTimeLine.initialState.currentTime,
            current: exerciseTimeLine.initialState.currentTime,
            end: presentState.currentTime,
        });
        this.setState(exerciseTimeLine.initialState);
        this.timeJumpHelper = new TimeJumpHelper(exerciseTimeLine);
    }

    public stopTimeTravel() {
        this.setTimeConstraints(undefined);
        this.exerciseTimeline = undefined;
        // Clean up the cache
        this.timeJumpHelper = undefined;
    }

    /**
     *
     * @param exerciseTime The time to travel to, if it isn't in the timeConstraints, it will be clamped appropriately
     */
    public async jumpToTime(exerciseTime: number): Promise<void> {
        if (!this.timeConstraints || !this.timeJumpHelper) {
            // TODO:
            throw new Error('Start the time travel before jumping to a time!');
        }
        const clampedTime = Math.max(
            this.timeConstraints.start,
            Math.min(this.timeConstraints.end, exerciseTime)
        );
        this.setTimeConstraints({
            ...this.timeConstraints,
            current: clampedTime,
        });
        // Update the exercise store with the state
        this.setState(this.timeJumpHelper.getStateAtTime(clampedTime));
    }

    private exerciseTimeline?: ExerciseTimeline;
    private async getExerciseTimeline(): Promise<ExerciseTimeline> {
        if (!this.exerciseTimeline) {
            this.exerciseTimeline = await this.getTimeLine();
        }
        return this.exerciseTimeline;
    }
}

export interface TimeConstraints {
    readonly start: number;
    readonly current: number;
    readonly end: number;
}
