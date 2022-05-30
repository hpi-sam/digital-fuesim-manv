import { Component, Input } from '@angular/core';
import { PatientStatusCode } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-patient-status-display',
    templateUrl: './patient-status-display.component.html',
    styleUrls: ['./patient-status-display.component.scss'],
})
export class PatientStatusDisplayComponent {
    @Input() patientStatus!: PatientStatusCode;
}
