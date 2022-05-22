import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { Hospital } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { selectHospitals } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-hospital-editor-modal',
    templateUrl: './hospital-editor-modal.component.html',
    styleUrls: ['./hospital-editor-modal.component.scss'],
})
export class HospitalEditorModalComponent {
    public hospitals$ = this.store.select(selectHospitals);

    constructor(
        private readonly store: Store<AppState>,
        public readonly activeModal: NgbActiveModal,
        private readonly apiService: ApiService
    ) {}

    public addHospital(hospital: Hospital) {
        this.apiService.proposeAction({
            type: '[Hospital] Add hospital',
            hospital,
        });
    }

    public close() {
        this.activeModal.close();
    }
}
