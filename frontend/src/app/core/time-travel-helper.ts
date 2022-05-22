import type { ExerciseAction, ExerciseState } from 'digital-fuesim-manv-shared';
import { applyAction, cloneDeepMutable } from 'digital-fuesim-manv-shared';
import produce from 'immer';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { getTimeLine } from './temp-timeline';

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
        this.setTimeConstraints(undefined);
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
                // If an action has been applied and adds part of it to the state (e.g. add a new element from the action),
                // this part is immutable, because the action is immutable.
                // If we try to mutate this part later on, we get an error because we modified the action, which is an immutable object
                // (enforced via Object.freeze).
                // To mitigate this, we clone the action to make it mutable.
                // TODO: Think more about Should this maybe even be another requirement in the reducers (Mutable actions)?
                const unfrozenAction = cloneDeepMutable(action);
                applyAction(draftState, unfrozenAction);
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
