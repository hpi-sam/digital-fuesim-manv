import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type { PatientStatus } from 'digital-fuesim-manv-shared';
import { Patient, SimulatedRegion, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectElementsInSimulatedRegion,
    selectConfiguration,
    selectPatients,
} from 'src/app/state/application/selectors/exercise.selectors';
import { comparePatientsByVisibleStatus } from '../../compare-patients';

@Component({
    selector: 'app-simulated-region-overview-patients-tab',
    templateUrl: './simulated-region-overview-patients-tab.component.html',
    styleUrls: ['./simulated-region-overview-patients-tab.component.scss'],
})
export class SimulatedRegionOverviewPatientsTabComponent implements OnInit {
    @Input() simulatedRegion!: SimulatedRegion;
    @Input() selectedPatientId?: UUID;

    patients$!: Observable<(Patient & { visibleStatus: PatientStatus })[]>;
    selectedPatientVisibleStatus$?: Observable<PatientStatus>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.patients$ = this.store.select(
            createSelector(
                createSelectElementsInSimulatedRegion(
                    selectPatients,
                    this.simulatedRegion.id
                ),
                selectConfiguration,
                (patients, configuration) =>
                    patients
                        .sort((patientA, patientB) =>
                            comparePatientsByVisibleStatus(
                                patientA,
                                patientB,
                                configuration
                            )
                        )
                        .map((patient) => ({
                            visibleStatus: Patient.getVisibleStatus(
                                patient,
                                configuration.pretriageEnabled,
                                configuration.bluePatientsEnabled
                            ),
                            ...patient,
                        }))
            )
        );
    }
}
