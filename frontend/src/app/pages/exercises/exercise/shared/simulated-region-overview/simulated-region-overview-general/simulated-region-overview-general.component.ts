import { Component, Input } from '@angular/core';
import { SimulatedRegion } from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';

@Component({
    selector: 'app-simulated-region-overview-general',
    templateUrl: './simulated-region-overview-general.component.html',
    styleUrls: ['./simulated-region-overview-general.component.scss'],
})
export class SimulatedRegionOverviewGeneralComponent {
    @Input() simulatedRegion!: SimulatedRegion;

    constructor(private readonly exerciseService: ExerciseService) {}

    public async renameSimulatedRegion(newName: string) {
        this.exerciseService.proposeAction({
            type: '[SimulatedRegion] Rename simulated region',
            simulatedRegionId: this.simulatedRegion.id,
            newName,
        });
    }
}
