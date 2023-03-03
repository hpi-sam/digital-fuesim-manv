import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { ExerciseSimulationBehaviorState } from 'digital-fuesim-manv-shared';
import {
    simulationBehaviors,
    SimulatedRegion,
} from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';

@Component({
    selector: 'app-simulated-region-overview-behavior-tab',
    templateUrl: './simulated-region-overview-behavior-tab.component.html',
    styleUrls: ['./simulated-region-overview-behavior-tab.component.scss'],
})
export class SimulatedRegionOverviewBehaviorTabComponent implements OnChanges {
    @Input() simulatedRegion!: SimulatedRegion;
    public behaviorsToBeAdded!: ExerciseSimulationBehaviorState[];
    public selectedBehavior?: ExerciseSimulationBehaviorState;
    constructor(private readonly exerciseService: ExerciseService) {}

    public addBehavior(behaviorState: ExerciseSimulationBehaviorState) {
        this.exerciseService.proposeAction({
            type: '[SimulatedRegion] Add Behavior',
            simulatedRegionId: this.simulatedRegion.id,
            behaviorState,
        });
    }

    public removeBehavior() {
        this.exerciseService.proposeAction({
            type: '[SimulatedRegion] Remove Behavior',
            simulatedRegionId: this.simulatedRegion.id,
            behaviorState: this.selectedBehavior!,
        });
        this.selectedBehavior = undefined;
    }

    public ngOnChanges() {
        this.calculateBehaviorsToBeAdded();
        if (
            this.selectedBehavior !== undefined &&
            !this.simulatedRegion.behaviors.includes(this.selectedBehavior)
        ) {
            this.selectedBehavior = undefined;
        }
    }

    public onBehaviorSelect(behavior: ExerciseSimulationBehaviorState): void {
        this.selectedBehavior = behavior;
    }

    public calculateBehaviorsToBeAdded() {
        this.behaviorsToBeAdded = Object.values(simulationBehaviors)
            .filter(
                (behavior) =>
                    !this.simulatedRegion.behaviors.some(
                        (behavior2) =>
                            behavior2.type === new behavior.behaviorState().type
                    )
            )
            .map((behavior) => new behavior.behaviorState());
    }
}
