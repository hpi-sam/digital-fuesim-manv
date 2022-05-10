import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import { selectViewports } from 'src/app/state/exercise/exercise.selectors';
import { AreaStatisticsService } from '../area-statistics.service';

@Component({
    selector: 'app-exercise-statistics-modal',
    templateUrl: './exercise-statistics-modal.component.html',
    styleUrls: ['./exercise-statistics-modal.component.scss'],
})
export class ExerciseStatisticsModalComponent {
    public viewports$ = this.store.select(selectViewports);

    constructor(
        public activeModal: NgbActiveModal,
        private readonly store: Store<AppState>,
        public readonly areaStatisticsService: AreaStatisticsService
    ) {}

    public close() {
        this.activeModal.close();
    }
}
