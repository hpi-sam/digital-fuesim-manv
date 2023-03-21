import { Component } from '@angular/core';
import { StoreService } from 'src/app/core/store.service';
import {
    selectCurrentTime,
    selectExerciseStatus,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-exercise-state-badge',
    templateUrl: './exercise-state-badge.component.html',
    styleUrls: ['./exercise-state-badge.component.scss'],
})
export class ExerciseStateBadgeComponent {
    public readonly exerciseStatus$ =
        this.storeService.select$(selectExerciseStatus);
    public readonly currentTime$ = this.storeService.select$(selectCurrentTime);

    constructor(private readonly storeService: StoreService) {}
}
