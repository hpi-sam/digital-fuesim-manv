import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type { AppState } from '../state/app.state';
import {
    selectExerciseId,
    selectLastClientName,
    selectMode,
} from '../state/application/application.selectors';
import { selectStateSnapshot } from '../state/get-state-snapshot';
import { ApiService } from './api.service';
import { TimeTravelService } from './time-travel.service';

@Injectable({
    providedIn: 'root',
})
export class ApplicationService {
    constructor(
        private readonly timeTravelService: TimeTravelService,
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>
    ) {}

    /**
     * A new mode must be set immediately after this function is called
     */
    private stopCurrentMode() {
        const currentMode = selectStateSnapshot(selectMode, this.store);
        switch (currentMode) {
            case 'exercise':
                this.apiService.leaveExercise();
                break;
            case 'timeTravel':
                this.timeTravelService.stopTimeTravel();
                break;
            case 'frontPage':
                break;
            default:
                assertExhaustiveness(currentMode);
        }
    }

    public async joinExercise(
        ...args: Parameters<typeof this.apiService.joinExercise>
    ) {
        this.stopCurrentMode();
        return this.apiService.joinExercise(...args);
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
