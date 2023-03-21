import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import type { UUID } from 'digital-fuesim-manv-shared';
import { Hospital } from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
import { selectHospitals } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-hospital-editor-modal',
    templateUrl: './hospital-editor-modal.component.html',
    styleUrls: ['./hospital-editor-modal.component.scss'],
})
export class HospitalEditorModalComponent {
    public hospitals$ = this.storeService.select$(selectHospitals);

    constructor(
        private readonly storeService: StoreService,
        public readonly activeModal: NgbActiveModal,
        private readonly exerciseService: ExerciseService
    ) {}

    public addHospital() {
        this.exerciseService.proposeAction({
            type: '[Hospital] Add hospital',
            hospital: Hospital.create('Krankenhaus-???', 60 * 60 * 1000),
        });
    }

    public editTransportDurationToHospital(
        hospitalId: UUID,
        transportDuration: number
    ) {
        this.exerciseService.proposeAction({
            type: '[Hospital] Edit transportDuration to hospital',
            hospitalId,
            transportDuration,
        });
    }

    public renameHospital(hospitalId: UUID, name: string) {
        this.exerciseService.proposeAction({
            type: '[Hospital] Rename hospital',
            hospitalId,
            name,
        });
    }

    public removeHospital(hospitalId: UUID) {
        this.exerciseService.proposeAction({
            type: '[Hospital] Remove hospital',
            hospitalId,
        });
    }

    public close() {
        this.activeModal.close();
    }
}
