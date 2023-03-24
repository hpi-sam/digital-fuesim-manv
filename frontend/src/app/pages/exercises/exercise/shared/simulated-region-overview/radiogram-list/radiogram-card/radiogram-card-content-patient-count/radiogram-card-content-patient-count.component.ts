import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import { PatientCountRadiogram } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { selectConfiguration } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-radiogram-card-content-patient-count',
    templateUrl: './radiogram-card-content-patient-count.component.html',
    styleUrls: ['./radiogram-card-content-patient-count.component.scss'],
})
export class RadiogramCardContentPatientCountComponent implements OnInit {
    @Input() radiogram!: PatientCountRadiogram;
    bluePatientsEnabled$!: Observable<boolean>;
    totalPatientCount!: number;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.totalPatientCount =
            this.radiogram.patientCount.black +
            this.radiogram.patientCount.white +
            this.radiogram.patientCount.red +
            this.radiogram.patientCount.yellow +
            this.radiogram.patientCount.green +
            this.radiogram.patientCount.blue;

        const bluePatientsEnabledSelector = createSelector(
            selectConfiguration,
            (configuration) => configuration.bluePatientsEnabled
        );
        this.bluePatientsEnabled$ = this.store.select(
            bluePatientsEnabledSelector
        );
    }
}
