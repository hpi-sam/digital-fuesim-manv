import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type {
    PatientStatus,
    PretriageInformation,
    UUID,
} from 'digital-fuesim-manv-shared';
import { Patient, statusNames } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectPatient,
    selectConfiguration,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
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
    public pretriageInformation$?: Observable<PretriageInformation>;
    public visibleStatus$?: Observable<PatientStatus>;
    public pretriageStatusIsLocked$?: Observable<boolean>;
    public readonly currentRole$ = this.store.select(selectCurrentRole);
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

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {}

    ngOnInit(): void {
        this.patient$ = this.store.select(createSelectPatient(this.patientId));
        this.visibleStatus$ = this.store.select(
            createSelector(
                createSelectPatient(this.patientId),
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
        this.pretriageInformation$ = this.patient$.pipe(
            map((patient) => Patient.getPretriageInformation(patient))
        );
    }

    setPretriageCategory(patientStatus: PatientStatus) {
        this.exerciseService.proposeAction({
            type: '[Patient] Set Visible Status',
            patientId: this.patientId,
            patientStatus,
        });
    }

    setPatientChangeSpeed(changeSpeed: string) {
        this.exerciseService.proposeAction({
            type: '[Patient] Set Change Speed',
            patientId: this.patientId,
            changeSpeed: Number(changeSpeed),
        });
    }

    public get statusNames() {
        return statusNames;
    }

    updateRemarks(remarks: string) {
        this.exerciseService.proposeAction({
            type: '[Patient] Set Remarks',
            patientId: this.patientId,
            remarks,
        });
    }
}
