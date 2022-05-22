import type { ExerciseAction, ExerciseState } from 'digital-fuesim-manv-shared';
import { applyAction } from 'digital-fuesim-manv-shared';
import produce from 'immer';
import { BehaviorSubject, map } from 'rxjs';

export class TimeTravelHelper {
    constructor(
        /**
         * Gets the state of the exercise at the real present time
         */
        private readonly getPresentState: () => ExerciseState,
        private readonly setState: (state: ExerciseState) => void,
        // TODO: get this from the server
        private readonly getTimeLine: () => Promise<ExerciseTimeline>
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
        map(() => this.isTimeTraveling)
    );

    public async startTimeTravel() {
        const { initialState } = await this.getExerciseTimeline();
        const presentState = this.getPresentState();
        this.setTimeConstraints({
            start: initialState.currentTime,
            current: presentState.currentTime,
            end: presentState.currentTime,
        });
    }

    public stopTimeTravel() {
        this.setTimeConstraints(this.timeConstraints);
        this.exerciseTimeline = undefined;
        // TODO: clean up cache if available
    }

    public async jumpToTime(exerciseTime: number): Promise<void> {
        if (!this.timeConstraints) {
            // TODO:
            throw new Error('Start the time travel before jumping to a time!');
        }
        this.setTimeConstraints({
            ...this.timeConstraints,
            current: exerciseTime,
        });
        const { initialState, actionsWrappers } =
            await this.getExerciseTimeline();
        // Apply all the actions
        // TODO: Maybe do this in a WebWorker?
        // TODO: Maybe cache already calculated states to improve performance when jumping on the timeline
        const stateAtTime = produce(initialState, (draftState) => {
            for (const { action } of actionsWrappers) {
                applyAction(draftState, action);
                // TODO: We actually want the last action after which currentTime <= exerciseTime
                // Maybe look wether the action is a tick action and if so, check how much time would go by
                if (draftState.currentTime > exerciseTime) {
                    break;
                }
            }
        });

        // Update the exercise store with the state
        this.setState(stateAtTime);
    }

    private exerciseTimeline?: ExerciseTimeline;
    private async getExerciseTimeline(): Promise<ExerciseTimeline> {
        if (!this.exerciseTimeline) {
            // TODO: get from server
            this.exerciseTimeline = await this.getTimeLine();
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
