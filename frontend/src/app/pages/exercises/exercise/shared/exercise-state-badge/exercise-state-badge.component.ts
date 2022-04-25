import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { StatusHistoryEntry } from 'digital-fuesim-manv-shared';
import type { AppState } from 'src/app/state/app.state';
import { selectCurrentTime } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-exercise-state-badge',
    templateUrl: './exercise-state-badge.component.html',
    styleUrls: ['./exercise-state-badge.component.scss'],
})
export class ExerciseStateBadgeComponent {
    @Input() latestState!: StatusHistoryEntry | null;

    public currentTime$ = this.store.select(selectCurrentTime);

    constructor(private readonly store: Store<AppState>) {}
}
