import { Component, Input } from '@angular/core';
import { PatientStatus, statusNames } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-patient-status-badge',
    templateUrl: './patient-status-badge.component.html',
    styleUrls: ['./patient-status-badge.component.scss'],
    standalone: false,
})
export class PatientStatusBadgeComponent {
    @Input() status!: PatientStatus;

    public readonly statusNames = statusNames;
}
