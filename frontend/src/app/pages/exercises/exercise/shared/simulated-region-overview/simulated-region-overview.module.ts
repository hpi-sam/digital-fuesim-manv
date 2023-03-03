import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SimulatedRegionOverviewGeneralComponent } from './overview/simulated-region-overview.component';
import { BehaviorTabComponent } from './tabs/behavior-tab/behavior-tab.component';
import { GeneralTabComponent } from './tabs/general-tab/general-tab.component';
import { TransferTabComponent } from './tabs/transfer-tab/transfer-tab.component';

@NgModule({
    declarations: [
        SimulatedRegionOverviewGeneralComponent,
        BehaviorTabComponent,
        GeneralTabComponent,
        TransferTabComponent,
    ],
    imports: [CommonModule, FormsModule, SharedModule, NgbNavModule],
    exports: [SimulatedRegionOverviewGeneralComponent],
})
export class SimulatedRegionOverviewModule {}
