import { Component, Input } from '@angular/core';
import { SimulatedRegion } from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';

@Component({
    selector: 'app-simulated-region-item',
    templateUrl: './simulated-region-item.component.html',
    styleUrls: ['./simulated-region-item.component.scss'],
})
export class SimulatedRegionItemComponent {
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
