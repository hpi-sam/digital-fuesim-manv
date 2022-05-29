import type { OnInit } from '@angular/core';
import { EventEmitter, Output, Component } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type { UUID, PatientStatus } from 'digital-fuesim-manv-shared';
import {
    healthPointsDefaults,
    statusNames,
    Patient,
} from 'digital-fuesim-manv-shared';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectPretriageEnabledConfiguration,
    selectBluePatientsEnabledConfiguration,
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
    public patientStatus$?: Observable<PatientStatus>;

    public currentYear = new Date().getFullYear();

    public pretriageEnabled$ = this.store.select(
        selectPretriageEnabledConfiguration
    );
    public bluePatientsEnabled$ = this.store.select(
        selectBluePatientsEnabledConfiguration
    );
    public readonly pretriageOptions$: Observable<PatientStatus[]> =
        this.bluePatientsEnabled$.pipe(
            map((bluePatientFlag) =>
                bluePatientFlag
                    ? ['black', 'blue', 'red', 'yellow', 'green']
                    : ['black', 'red', 'yellow', 'green']
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
        this.patientStatus$ = this.store.select(
            createSelector(
                getSelectPatient(this.patientId),
                selectPretriageEnabledConfiguration,
                selectBluePatientsEnabledConfiguration,
                (patient, pretriageEnabled, bluePatientsEnabled) =>
                    Patient.getVisibleStatus(
                        patient,
                        pretriageEnabled,
                        bluePatientsEnabled
                    )
            )
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
}
