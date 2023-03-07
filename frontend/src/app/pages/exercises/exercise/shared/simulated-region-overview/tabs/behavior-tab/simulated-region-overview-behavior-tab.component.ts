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
    public behaviorsToBeAdded: ExerciseSimulationBehaviorState[] = [];
    public selectedBehavior?: ExerciseSimulationBehaviorState;
    constructor(private readonly exerciseService: ExerciseService) {}

    public addBehavior(behaviorState: ExerciseSimulationBehaviorState) {
        this.exerciseService.proposeAction({
            type: '[SimulatedRegion] Add Behavior',
            simulatedRegionId: this.simulatedRegion.id,
            behaviorState,
        });
    }

    public removeSelectedBehavior() {
        this.exerciseService.proposeAction({
            type: '[SimulatedRegion] Remove Behavior',
            simulatedRegionId: this.simulatedRegion.id,
            behaviorId: this.selectedBehavior!.id,
        });
        this.selectedBehavior = undefined;
    }

    public ngOnChanges() {
        this.updateBehaviorsToBeAdded();
        if (
            // if the selected behavior has been removed by a different client
            this.selectedBehavior !== undefined &&
            !this.simulatedRegion.behaviors.includes(this.selectedBehavior)
        ) {
            this.selectedBehavior = this.simulatedRegion.behaviors.find(
                (behavior) => behavior.id === this.selectedBehavior?.id
            );
        }
    }

    public onBehaviorSelect(behavior: ExerciseSimulationBehaviorState): void {
        this.selectedBehavior = behavior;
    }

    private updateBehaviorsToBeAdded() {
        this.behaviorsToBeAdded = Object.values(simulationBehaviors)
            .map((behavior) => new behavior.behaviorState())
            .filter(
                (behaviorState) =>
                    !this.simulatedRegion.behaviors.some(
                        (regionBehaviorState) =>
                            regionBehaviorState.type === behaviorState.type
                    )
            );
    }
}
