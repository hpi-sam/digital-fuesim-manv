import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector } from '@ngrx/store';
import type { PatientStatus } from 'digital-fuesim-manv-shared';
import {
    healthPointsDefaults,
    Patient,
    statusNames,
    UUID,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { StoreService } from 'src/app/core/store.service';
import {
    createSelectPatient,
    selectConfiguration,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';

@Component({
    selector: 'app-patient-health-point-display',
    templateUrl: './patient-health-point-display.component.html',
    styleUrls: ['./patient-health-point-display.component.scss'],
})
export class PatientHealthPointDisplayComponent implements OnInit {
    @Input() patientId!: UUID;

    status$!: Observable<{
        real: PatientStatus;
        visible: PatientStatus;
        health: number;
    }>;

    public readonly currentRole$ = this.storeService.select$(selectCurrentRole);

    public readonly healthPointsDefaults = healthPointsDefaults;

    constructor(private readonly storeService: StoreService) {}

    ngOnInit(): void {
        this.status$ = this.storeService.select$(
            createSelector(
                createSelectPatient(this.patientId),
                selectConfiguration,
                (patient, configuration) => ({
                    real: patient.realStatus,
                    visible: Patient.getVisibleStatus(
                        patient,
                        configuration.pretriageEnabled,
                        configuration.bluePatientsEnabled
                    ),
                    health: patient.health,
                })
            )
        );
    }

    public get statusNames() {
        return statusNames;
    }
}
