import { Component, Input } from '@angular/core';
import {
    TreatPatientsBehaviorState,
    SimulatedRegion,
} from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';

@Component({
    selector: 'app-simulated-region-overview-behavior-treat-patients',
    templateUrl:
        './simulated-region-overview-behavior-treat-patients.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-treat-patients.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorTreatPatientsComponent {
    @Input() simulatedRegion!: SimulatedRegion;
    @Input() treatPatientsBehaviorState!: TreatPatientsBehaviorState;

    constructor(private readonly exerciseService: ExerciseService) {}

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
