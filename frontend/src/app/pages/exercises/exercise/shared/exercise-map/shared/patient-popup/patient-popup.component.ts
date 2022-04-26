import type { OnInit } from '@angular/core';
import { EventEmitter, Output, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, Patient } from 'digital-fuesim-manv-shared';
import { healthPointsDefaults, statusNames } from 'digital-fuesim-manv-shared';
import type { MedicalInformation } from 'digital-fuesim-manv-shared/src/models/utils';
import type { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectClient,
    getSelectPatient,
} from 'src/app/state/exercise/exercise.selectors';
import type { PopupComponent } from '../../utility/popup-manager';

@Component({
    selector: 'app-patient-popup',
    templateUrl: './patient-popup.component.html',
    styleUrls: ['./patient-popup.component.scss'],
})
export class PatientPopupComponent implements PopupComponent, OnInit {
    // These properties are only set after OnInit
    public patientId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public patient$?: Observable<Patient>;
    public client$ = this.store.select(
        getSelectClient(this.apiService.ownClientId!)
    );

    public currentYear = new Date().getFullYear();

    // To use it in the template
    public readonly healthPointsDefaults = healthPointsDefaults;

    public medicalInformationTranslations: {
        [key in keyof MedicalInformation]?: string;
    } = {
        breathing: 'Atmung',
        consciousness: 'Bewusstsein',
        pulse: 'Puls',
        skin: 'Haut',
        pain: 'Schmerzen',
        pupils: 'Pupillen',
        psyche: 'Psyche',
        hearing: 'Hörvermögen',
        injuries: 'Verletzungen',
        bodyCheck: 'Body-check',
    };

    // The keyvalue pipe sorts by default the keys alphabetically
    public readonly keepOrder = (a?: any, b?: any) => a;

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.patient$ = this.store.select(getSelectPatient(this.patientId));
    }

    public get statusNames() {
        return statusNames;
    }
}
