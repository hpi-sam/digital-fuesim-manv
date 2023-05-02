import { Component } from '@angular/core';
import type { UUID } from 'digital-fuesim-manv-shared';
import { PopupService } from '../../utility/popup.service';

@Component({
    selector: 'app-patient-popup',
    templateUrl: './patient-popup.component.html',
    styleUrls: ['./patient-popup.component.scss'],
})
export class PatientPopupComponent {
    // These properties are only set after OnInit
    public patientId!: UUID;

    constructor(private readonly popupService: PopupService) {}

    public closePopup() {
        this.popupService.closePopup();
    }
}
