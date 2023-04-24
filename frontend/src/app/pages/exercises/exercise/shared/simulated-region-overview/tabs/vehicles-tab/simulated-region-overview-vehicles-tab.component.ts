import { Component, Input } from '@angular/core';
import { SimulatedRegion } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-simulated-region-overview-vehicles-tab',
    templateUrl: './simulated-region-overview-vehicles-tab.component.html',
    styleUrls: ['./simulated-region-overview-vehicles-tab.component.scss'],
})
export class SimulatedRegionOverviewVehiclesTabComponent {
    @Input()
    simulatedRegion!: SimulatedRegion;
}
