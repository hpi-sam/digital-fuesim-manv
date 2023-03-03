import { Component, Input } from '@angular/core';
import { SimulatedRegion } from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';

@Component({
    selector: 'app-simulated-region-overview-general-tab',
    templateUrl: './simulated-region-overview-general-tab.component.html',
    styleUrls: ['./simulated-region-overview-general-tab.component.scss'],
})
export class SimulatedRegionOverviewGeneralTabComponent {
    @Input() simulatedRegion!: SimulatedRegion;

    constructor(private readonly exerciseService: ExerciseService) {}

    public async renameSimulatedRegion(newName: string) {
        if (this.simulatedRegion.transferPointId) {
            this.exerciseService.proposeAction({
                type: '[TransferPoint] Rename TransferPoint',
                transferPointId: this.simulatedRegion.transferPointId,
                externalName: `[Simuliert] ${newName}`,
            });
        }
        this.exerciseService.proposeAction({
            type: '[SimulatedRegion] Rename simulated region',
            simulatedRegionId: this.simulatedRegion.id,
            newName,
        });
    }
}
