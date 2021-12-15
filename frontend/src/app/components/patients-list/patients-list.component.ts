import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { UUID } from 'digital-fuesim-manv-shared';
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { AppState } from 'src/app/state/app.state';
import { selectPatients } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-patients-list',
    templateUrl: './patients-list.component.html',
    styleUrls: ['./patients-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientsListComponent implements OnDestroy {
    private readonly destroy = new Subject<unknown>();

    public readonly patients$ = this.store.select(selectPatients);
    public readonly numberOfPatients$ = this.store.select(
        (state) => Object.keys(state.exercise.patients).length
    );

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService
    ) {}

    public removePatient(patientId: UUID) {
        this.apiService.proposeAction({
            type: '[Patient] Remove patient',
            patientId,
        });
    }

    ngOnDestroy() {
        this.destroy.next(null);
    }
}
