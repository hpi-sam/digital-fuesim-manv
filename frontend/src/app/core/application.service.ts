import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { TimeTravelService } from './time-travel.service';

@Injectable({
    providedIn: 'root',
})
export class ApplicationService {
    constructor(
        private readonly timeTravelService: TimeTravelService,
        private readonly apiService: ApiService
    ) {}

    private currentMode: ApplicationMode = 'frontPage';

    private stopCurrentMode() {
        switch (this.currentMode) {
            case 'exercise':
                this.apiService.leaveExercise();
                break;
            case 'timeTravel':
                this.timeTravelService.stopTimeTravel();
                break;
            case 'frontPage':
                break;
            default:
                assertExhaustiveness(this.currentMode);
        }
    }

    public async joinExercise(
        ...args: Parameters<typeof this.apiService.joinExercise>
    ) {
        this.stopCurrentMode();
        this.currentMode = 'exercise';
        return this.apiService.joinExercise(...args);
    }

    public async startTimeTravel(
        ...args: Parameters<typeof this.timeTravelService.startTimeTravel>
    ) {
        this.stopCurrentMode();
        this.currentMode = 'timeTravel';
        return this.timeTravelService.startTimeTravel(...args);
    }

    public async leaveExercise() {
        this.stopCurrentMode();
        this.currentMode = 'frontPage';
    }
}

type ApplicationMode = 'exercise' | 'frontPage' | 'timeTravel';

function assertExhaustiveness(variable: never) {
    throw Error(`Unhandled case: ${variable}`);
}
