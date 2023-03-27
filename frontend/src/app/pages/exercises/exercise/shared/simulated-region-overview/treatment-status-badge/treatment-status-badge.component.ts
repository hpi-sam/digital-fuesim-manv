import { Component, Input } from '@angular/core';
import { TreatmentProgress } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-treatment-status-badge',
    templateUrl: './treatment-status-badge.component.html',
    styleUrls: ['./treatment-status-badge.component.scss'],
})
export class TreatmentStatusBadgeComponent {
    @Input() treatmentProgress!: TreatmentProgress;
}
