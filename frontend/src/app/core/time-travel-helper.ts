import type { ExerciseAction, ExerciseState } from 'digital-fuesim-manv-shared';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { getTimeLine } from './temp-timeline';
import { TimeJumpHelper } from './time-jump-helper';

export class TimeTravelHelper {
    constructor(
        /**
         * Gets the state of the exercise at the real present time
         */
        private readonly getPresentState: () => ExerciseState,
        private readonly setState: (state: ExerciseState) => void
    ) {}

    private timeConstraints?: TimeConstraints;
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

    public async jumpToTime(exerciseTime: number): Promise<void> {
        if (!this.timeConstraints || !this.timeJumpHelper) {
            // TODO:
            throw new Error('Start the time travel before jumping to a time!');
        }
        this.setTimeConstraints({
            ...this.timeConstraints,
            current: exerciseTime,
        });
        // Update the exercise store with the state
        this.setState(this.timeJumpHelper.getStateAtTime(exerciseTime));
    }

    private exerciseTimeline?: ExerciseTimeline;
    private async getExerciseTimeline(): Promise<ExerciseTimeline> {
        if (!this.exerciseTimeline) {
            // TODO: get from server
            this.exerciseTimeline = await getTimeLine();
        }
        return this.exerciseTimeline;
    }
}

export interface ExerciseTimeline {
    readonly initialState: ExerciseState;
    readonly actionsWrappers: readonly {
        readonly action: ExerciseAction;
        readonly time: number;
    }[];
}

export interface TimeConstraints {
    readonly start: number;
    readonly current: number;
    readonly end: number;
}
