import { Component, Input } from '@angular/core';
import {
    PatientStatusDataField,
    colorCodeMap,
    behaviourCodeMap,
} from 'digital-fuesim-manv-shared';
import { rgbColorPalette } from 'src/app/shared/functions/colors';

@Component({
    selector: 'app-patient-status-data-field',
    templateUrl: './patient-status-data-field.component.html',
    styleUrls: ['./patient-status-data-field.component.scss'],
})
export class PatientStatusDataFieldComponent {
    @Input() patientStatusDataField!: PatientStatusDataField;

    public get colorCodeMap() {
        return colorCodeMap;
    }

    public get behaviourCodeMap() {
        return behaviourCodeMap;
    }

    public get rgbColorPalette() {
        return rgbColorPalette;
    }
}
