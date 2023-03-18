import { Component, EventEmitter, Output } from '@angular/core';
import type { UUID } from 'digital-fuesim-manv-shared';
import type { PopupComponent } from '../../utility/popup-manager';

@Component({
    selector: 'app-patient-popup',
    templateUrl: './patient-popup.component.html',
    styleUrls: ['./patient-popup.component.scss'],
})
export class PatientPopupComponent implements PopupComponent {
    // These properties are only set after OnInit
    public patientId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();
}
