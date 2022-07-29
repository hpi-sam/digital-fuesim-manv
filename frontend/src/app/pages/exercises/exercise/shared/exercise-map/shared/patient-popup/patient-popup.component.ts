import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type { PatientStatus, UUID } from 'digital-fuesim-manv-shared';
import {
    healthPointsDefaults,
    Patient,
    statusNames,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectPatient,
    selectConfiguration,
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
    public visibleStatus$?: Observable<PatientStatus>;
    public pretriageStatusIsLocked$?: Observable<boolean>;

    public currentYear = new Date().getFullYear();

    public configuration$ = this.store.select(selectConfiguration);

    public readonly pretriageOptions$: Observable<PatientStatus[]> =
        this.configuration$.pipe(
            map((configuration) =>
                configuration.bluePatientsEnabled
                    ? ['white', 'black', 'blue', 'red', 'yellow', 'green']
                    : ['white', 'black', 'red', 'yellow', 'green']
            )
        );

    // To use it in the template
    public readonly healthPointsDefaults = healthPointsDefaults;

    constructor(
        private readonly store: Store<AppState>,
        public readonly apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.patient$ = this.store.select(getSelectPatient(this.patientId));
        this.visibleStatus$ = this.store.select(
            createSelector(
                getSelectPatient(this.patientId),
                selectConfiguration,
                (patient, configuration) =>
                    Patient.getVisibleStatus(
                        patient,
                        configuration.pretriageEnabled,
                        configuration.bluePatientsEnabled
                    )
            )
        );
        this.pretriageStatusIsLocked$ = this.patient$.pipe(
            map((patient) => Patient.pretriageStatusIsLocked(patient))
        );
    }

    setPretriageCategory(patientStatus: PatientStatus) {
        this.apiService.proposeAction({
            type: '[Patient] Set Visible Status',
            patientId: this.patientId,
            patientStatus,
        });
    }

    public get statusNames() {
        return statusNames;
    }

    updateUserText(userText: string) {
        this.apiService.proposeAction({
            type: '[Patient] Set User Text',
            patientId: this.patientId,
            userText,
        });
    }
}
