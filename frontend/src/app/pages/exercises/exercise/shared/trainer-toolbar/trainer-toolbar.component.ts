import { Input, Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { selectLatestStatusHistoryEntry } from 'src/app/state/exercise/exercise.selectors';
import { openClientOverviewModal } from '../client-overview/open-client-overview-modal';

@Component({
    selector: 'app-trainer-toolbar',
    templateUrl: './trainer-toolbar.component.html',
    styleUrls: ['./trainer-toolbar.component.scss'],
})
export class TrainerToolbarComponent {
    @Input() exerciseId!: string;

    public exercisePausedState$ = this.store.select(
        selectLatestStatusHistoryEntry
    );

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService,
        private readonly modalService: NgbModal
    ) {}

    public openClientOverview() {
        openClientOverviewModal(this.modalService, this.exerciseId!);
    }

    public async pauseExercise() {
        const response = await this.apiService.proposeAction({
            type: '[Exercise] Pause',
            timestamp: Date.now(),
        });
        if (!response.success) {
            console.error(response.message);
        }
    }

    public async startExercise() {
        const response = await this.apiService.proposeAction({
            type: '[Exercise] Start',
            timestamp: Date.now(),
        });
        if (!response.success) {
            console.error(response.message);
        }
    }
}
