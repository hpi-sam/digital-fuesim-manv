import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Hospital } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';

@Component({
    selector: 'app-hospital-editor-item',
    templateUrl: './hospital-editor-item.component.html',
    styleUrls: ['./hospital-editor-item.component.scss'],
})
export class HospitalEditorItemComponent {
    @Input() hospital!: Hospital;

    constructor(
        private readonly store: Store<AppState>,
        public readonly activeModal: NgbActiveModal,
        private readonly apiService: ApiService
    ) {}

    public editTransportDurationToHospital(transportDuration: number) {
        this.apiService.proposeAction({
            type: '[Hospital] Edit transportDuration to hospital',
            hospitalId: this.hospital.id,
            transportDuration,
        });
    }

    public renameHospital(name: string) {
        this.apiService.proposeAction({
            type: '[Hospital] Rename hospital',
            hospitalId: this.hospital.id,
            name,
        });
    }

    public removeHospital() {
        this.apiService.proposeAction({
            type: '[Hospital] Remove hospital',
            hospitalId: this.hospital.id,
        });
    }

    public close() {
        this.activeModal.close();
    }
}
