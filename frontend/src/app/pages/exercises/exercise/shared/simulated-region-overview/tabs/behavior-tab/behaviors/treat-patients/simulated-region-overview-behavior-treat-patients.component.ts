import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { Patient, UUIDSet } from 'digital-fuesim-manv-shared';
import { isInSpecificSimulatedRegion } from 'digital-fuesim-manv-shared';
// eslint-disable-next-line @typescript-eslint/no-duplicate-imports
import {
    TreatPatientsBehaviorState,
    SimulatedRegion,
} from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { selectPatients } from 'src/app/state/application/selectors/exercise.selectors';

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
    public patients!: Patient[];

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {}

    ngOnInit(): void {
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        this.store.select(selectPatients).subscribe((patients) => {
            this.patients = Object.values(patients).filter((patient) =>
                isInSpecificSimulatedRegion(patient, this.simulatedRegion.id)
            );
        });
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
            type: '[Simulation] Update TreatPatientsIntervals',
            simulatedRegionId: this.simulatedRegion.id,
            behaviorStateId: this.treatPatientsBehaviorState.id,
            unknown,
            counted,
            triaged,
            secured,
            countingTimePerPatient,
        });
    }
}
