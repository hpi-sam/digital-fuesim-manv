import { Component, Input } from '@angular/core';
import { UUID } from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';
import { SelectPatientService } from '../../../select-patient.service';

@Component({
    selector: 'app-simulated-region-overview-patient-interaction-bar',
    templateUrl:
        './simulated-region-overview-patient-interaction-bar.component.html',
    styleUrls: [
        './simulated-region-overview-patient-interaction-bar.component.scss',
    ],
})
export class SimulatedRegionOverviewPatientInteractionBarComponent {
    @Input() patientId!: UUID;

    constructor(
        private readonly exerciseService: ExerciseService,
        readonly selectPatientService: SelectPatientService
    ) {}

    public removeSelectedPatientFromSimulatedRegion() {
        this.exerciseService.proposeAction({
            type: '[Patient] Remove patient from simulated region',
            patientId: this.patientId,
        });
        this.selectPatientService.selectPatient('');
    }

    public deleteSelectedPatient() {
        this.exerciseService.proposeAction({
            type: '[Patient] Remove patient',
            patientId: this.patientId,
        });
        this.selectPatientService.selectPatient('');
    }
}
