import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type { ExerciseAction } from 'digital-fuesim-manv-shared';
import { applyAction, ExerciseState } from 'digital-fuesim-manv-shared';
import produce from 'immer';
import type { AppState } from '../state/app.state';
import { setExerciseState } from '../state/exercise/exercise.actions';

@Injectable({
    providedIn: 'root',
})
export class TimeTravelService {
    constructor(private readonly store: Store<AppState>) {}

    /**
     * Wether the user is currently in the time travel mode instead of the present state of the exercise.
     */
    public isTimeTraveling = false;

    public currentExerciseTime?: number;

    public async jumpToTime(exerciseTime: number): Promise<void> {
        this.isTimeTraveling = true;
        this.currentExerciseTime = exerciseTime;
        const { initialState, actionsWrappers } =
            await this.getExerciseTimeline();
        // Apply all the actions
        // TODO: Maybe do this in a WebWorker?
        // TODO: Maybe cache already calculated states to improve performance when jumping on the timeline
        const stateAtTime = produce(initialState, (draftState) => {
            for (const { action } of actionsWrappers) {
                applyAction(draftState, action);
                // TODO: We actually want the last action after which currentTime <= exerciseTime
                if (draftState.currentTime > exerciseTime) {
                    break;
                }
            }
        });
        // Update the exercise store with the state
        this.store.dispatch(setExerciseState(stateAtTime));
    }

    private exerciseTimeline?: ExerciseTimeline;
    private async getExerciseTimeline(
        forceRefresh = false
    ): Promise<ExerciseTimeline> {
        if (!this.exerciseTimeline || forceRefresh) {
            // TODO: get from server
            this.exerciseTimeline = {
                initialState: ExerciseState.create(),
                actionsWrappers: [],
            };
        }
        return this.exerciseTimeline;
    }
}

interface ExerciseTimeline {
    initialState: ExerciseState;
    actionsWrappers: {
        action: ExerciseAction;
        time: number;
    }[];
}
