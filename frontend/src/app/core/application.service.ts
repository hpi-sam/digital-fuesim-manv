import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type { AppState } from '../state/app.state';
import {
    selectExerciseId,
    selectExerciseStateMode,
    selectLastClientName,
} from '../state/application/selectors/application.selectors';
import { selectStateSnapshot } from '../state/get-state-snapshot';
import { ExerciseService } from './exercise.service';
import { TimeTravelService } from './time-travel.service';

@Injectable({
    providedIn: 'root',
})
export class ApplicationService {
    constructor(
        private readonly timeTravelService: TimeTravelService,
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {}

    /**
     * A new mode must be set immediately after this function is called
     */
    private stopCurrentMode() {
        const currentExerciseStateMode = selectStateSnapshot(
            selectExerciseStateMode,
            this.store
        );
        switch (currentExerciseStateMode) {
            case 'exercise':
                this.exerciseService.leaveExercise();
                break;
            case 'timeTravel':
                this.timeTravelService.stopTimeTravel();
                break;
            case undefined:
                break;
            default:
                assertExhaustiveness(currentExerciseStateMode);
        }
    }

    public async joinExercise(
        ...args: Parameters<typeof this.exerciseService.joinExercise>
    ) {
        this.stopCurrentMode();
        return this.exerciseService.joinExercise(...args);
    }

    /**
     * Assuming that the client was already connected to an exercise:
     * Rejoin this exercise with the same credentials as the last time
     */
    public async rejoinExercise() {
        return this.joinExercise(
            selectStateSnapshot(selectExerciseId, this.store)!,
            selectStateSnapshot(selectLastClientName, this.store)!
        );
    }

    public async startTimeTravel(
        ...args: Parameters<typeof this.timeTravelService.startTimeTravel>
    ) {
        this.stopCurrentMode();
        return this.timeTravelService.startTimeTravel(...args);
    }

    public async leaveExercise() {
        this.stopCurrentMode();
    }
}

function assertExhaustiveness(variable: never) {
    throw Error(`Unhandled case: ${variable}`);
}
