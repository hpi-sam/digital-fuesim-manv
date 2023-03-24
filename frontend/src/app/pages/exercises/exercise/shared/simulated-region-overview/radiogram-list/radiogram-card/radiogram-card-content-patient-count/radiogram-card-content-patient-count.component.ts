import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { MemoizedSelector } from '@ngrx/store';
import { createSelector, Store } from '@ngrx/store';
import type {
    ExerciseRadiogram,
    PatientCountRadiogram,
} from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectRadiogram,
    selectConfiguration,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-radiogram-card-content-patient-count',
    templateUrl: './radiogram-card-content-patient-count.component.html',
    styleUrls: ['./radiogram-card-content-patient-count.component.scss'],
})
export class RadiogramCardContentPatientCountComponent implements OnInit {
    @Input() radiogramId!: UUID;
    radiogram$!: Observable<PatientCountRadiogram>;
    bluePatientsEnabled$!: Observable<boolean>;
    totalPatientCount$!: Observable<number>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        const radiogramSelector = createSelectRadiogram(
            this.radiogramId
        ) as MemoizedSelector<
            AppState,
            NonNullable<PatientCountRadiogram>,
            (s1: {
                [key: string]: ExerciseRadiogram;
            }) => NonNullable<PatientCountRadiogram>
        >;

        const totalPatientCountSelector = createSelector(
            radiogramSelector,
            (radiogram) =>
                radiogram.patientCount.black +
                radiogram.patientCount.white +
                radiogram.patientCount.red +
                radiogram.patientCount.yellow +
                radiogram.patientCount.green +
                radiogram.patientCount.blue
        );

        const bluePatientsEnabledSelector = createSelector(
            selectConfiguration,
            (configuration) => configuration.bluePatientsEnabled
        );

        this.radiogram$ = this.store.select(radiogramSelector);
        this.totalPatientCount$ = this.store.select(totalPatientCountSelector);
        this.bluePatientsEnabled$ = this.store.select(
            bluePatientsEnabledSelector
        );
    }
}
