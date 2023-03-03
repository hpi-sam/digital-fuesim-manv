import { Component, Input } from '@angular/core';
import { SimulatedRegion } from 'digital-fuesim-manv-shared';

type NavIds = 'behaviors' | 'general' | 'transfer';
/**
 * We want to remember the last selected nav item, so the user doesn't have to manually select it again.
 */
let activeNavId: NavIds = 'general';

@Component({
    selector: 'app-simulated-region-overview-general',
    templateUrl: './simulated-region-overview.component.html',
    styleUrls: ['./simulated-region-overview.component.scss'],
})
export class SimulatedRegionOverviewGeneralComponent {
    @Input() simulatedRegion!: SimulatedRegion;

    public get activeNavId() {
        return activeNavId;
    }
    public set activeNavId(value: NavIds) {
        activeNavId = value;
    }
}
