import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector } from '@ngrx/store';
import type { PatientStatus } from 'digital-fuesim-manv-shared';
import { Patient, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
import {
    createSelectPatient,
    selectConfiguration,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';

@Component({
    selector: 'app-patients-details',
    templateUrl: './patients-details.component.html',
    styleUrls: ['./patients-details.component.scss'],
})
export class PatientsDetailsComponent implements OnChanges {
    @Input() patientId!: UUID;

    readonly currentRole$ = this.storeService.select$(selectCurrentRole);
    configuration$ = this.storeService.select$(selectConfiguration);
    patient$!: Observable<Patient>;
    visibleStatus$!: Observable<PatientStatus>;
    pretriageStatusIsLocked$?: Observable<boolean>;
    readonly pretriageOptions$: Observable<PatientStatus[]> =
        this.configuration$.pipe(
            map((configuration) =>
                configuration.bluePatientsEnabled
                    ? ['white', 'black', 'blue', 'red', 'yellow', 'green']
                    : ['white', 'black', 'red', 'yellow', 'green']
            )
        );

    constructor(
        private readonly storeService: StoreService,
        private readonly exerciseService: ExerciseService
    ) {}

    ngOnChanges(): void {
        this.patient$ = this.storeService.select$(
            createSelectPatient(this.patientId)
        );
        this.visibleStatus$ = this.storeService.select$(
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
    }

    setPretriageCategory(patientStatus: PatientStatus) {
        this.exerciseService.proposeAction({
            type: '[Patient] Set Visible Status',
            patientId: this.patientId,
            patientStatus,
        });
    }

    updateRemarks(remarks: string) {
        this.exerciseService.proposeAction({
            type: '[Patient] Set Remarks',
            patientId: this.patientId,
            remarks,
        });
    }
}
