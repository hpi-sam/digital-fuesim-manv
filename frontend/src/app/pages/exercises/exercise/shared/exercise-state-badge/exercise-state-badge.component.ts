import { Component, Input } from '@angular/core';
import type { StatusHistoryEntry } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-exercise-state-badge',
    templateUrl: './exercise-state-badge.component.html',
    styleUrls: ['./exercise-state-badge.component.scss'],
})
export class ExerciseStateBadgeComponent {
    @Input() latestState!: StatusHistoryEntry | null;
}
