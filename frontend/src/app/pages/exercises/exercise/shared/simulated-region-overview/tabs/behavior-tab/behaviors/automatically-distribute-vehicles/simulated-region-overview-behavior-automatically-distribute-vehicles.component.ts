import { Component, Input } from '@angular/core';
import { UUID } from 'digital-fuesim-manv-shared';

@Component({
    selector:
        'app-simulated-region-overview-behavior-automatically-distribute-vehicles',
    templateUrl:
        './simulated-region-overview-behavior-automatically-distribute-vehicles.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-automatically-distribute-vehicles.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorAutomaticallyDistributeVehiclesComponent {
    @Input() simulatedRegionId!: UUID;
    @Input() automaticallyDistributeVehiclesBehaviorId!: UUID;
}
