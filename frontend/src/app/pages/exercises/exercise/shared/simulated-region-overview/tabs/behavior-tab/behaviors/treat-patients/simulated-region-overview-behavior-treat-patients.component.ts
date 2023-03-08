import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type {
    PatientStatus,
    UUID,
    UUIDSet,
    ExerciseConfiguration,
} from 'digital-fuesim-manv-shared';
import {
    Patient,
    TreatPatientsBehaviorState,
    SimulatedRegion,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectElementsInSimulatedRegion,
    selectConfiguration,
    selectPatients,
} from 'src/app/state/application/selectors/exercise.selectors';

let globalLastSettingsCollapsed = true;
let globalLastInformationCollapsed = true;
@Component({
    selector: 'app-simulated-region-overview-behavior-treat-patients',
    templateUrl:
        './simulated-region-overview-behavior-treat-patients.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-treat-patients.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorTreatPatientsComponent
    implements OnInit
{
    @Input() simulatedRegion!: SimulatedRegion;
    @Input() treatPatientsBehaviorState!: TreatPatientsBehaviorState;
    public patientIds$!: Observable<UUID[]>;
    private _settingsCollapsed!: boolean;
    private _informationCollapsed!: boolean;

    public get settingsCollapsed(): boolean {
        return this._settingsCollapsed;
    }
    public set settingsCollapsed(value: boolean) {
        this._settingsCollapsed = value;
        globalLastSettingsCollapsed = value;
    }
    public get informationCollapsed(): boolean {
        return this._informationCollapsed;
    }
    public set informationCollapsed(value: boolean) {
        this._informationCollapsed = value;
        globalLastInformationCollapsed = value;
    }

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {}

    ngOnInit(): void {
        this.settingsCollapsed = globalLastSettingsCollapsed;
        this.informationCollapsed = globalLastInformationCollapsed;
        this.patientIds$ = this.store.select(
            createSelector(
                createSelectElementsInSimulatedRegion(
                    selectPatients,
                    this.simulatedRegion.id
                ),
                selectConfiguration,
                (patients, configuration) =>
                    patients
                        .sort((patientA, patientB) =>
                            this.comparePatientsByTriageCategory(
                                patientA,
                                patientB,
                                configuration
                            )
                        )
                        .map((patient) => patient.id)
            )
        );
    }

    public help(s: UUIDSet) {
        return Object.keys(s);
    }

    public updateTreatPatientsBehaviorState(
        unknown: number,
        counted: number,
        triaged: number,
        secured: number,
        countingTimePerPatient: number
    ) {
        this.exerciseService.proposeAction({
            type: '[TreatPatientsBehavior] Update TreatPatientsIntervals',
            simulatedRegionId: this.simulatedRegion.id,
            behaviorStateId: this.treatPatientsBehaviorState.id,
            unknown,
            counted,
            triaged,
            secured,
            countingTimePerPatient,
        });
    }

    private comparePatientsByTriageCategory(
        patientA: Patient,
        patientB: Patient,
        configuration: ExerciseConfiguration
    ): number {
        let statusA!: PatientStatus;
        let statusB!: PatientStatus;

        if (patientA === undefined) {
            statusA = 'white';
        } else {
            statusA = Patient.getVisibleStatus(
                patientA,
                configuration.pretriageEnabled,
                configuration.bluePatientsEnabled
            );
        }
        if (patientB === undefined) {
            statusB = 'white';
        } else {
            statusB = Patient.getVisibleStatus(
                patientB,
                configuration.pretriageEnabled,
                configuration.bluePatientsEnabled
            );
        }

        const patientCategoryOrderDictionary: {
            [Key in PatientStatus]: number;
        } = {
            black: 5,
            blue: 4,
            green: 3,
            red: 1,
            white: 0,
            yellow: 2,
        };
        const valueA = patientCategoryOrderDictionary[statusA];
        const valueB = patientCategoryOrderDictionary[statusB];
        return valueA !== valueB
            ? valueA - valueB
            : patientCategoryOrderDictionary[patientA.realStatus] -
                  patientCategoryOrderDictionary[patientB.realStatus];
    }
}
