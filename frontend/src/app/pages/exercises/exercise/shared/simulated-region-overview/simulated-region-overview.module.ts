import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import {
    NgbCollapseModule,
    NgbDropdownModule,
    NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TransferPointOverviewModule } from '../transfer-point-overview/transfer-point-overview.module';
import { SimulatedRegionOverviewGeneralComponent } from './overview/simulated-region-overview.component';
import { SimulatedRegionOverviewBehaviorTabComponent } from './tabs/behavior-tab/simulated-region-overview-behavior-tab.component';
import { SimulatedRegionOverviewGeneralTabComponent } from './tabs/general-tab/simulated-region-overview-general-tab.component';
import { SimulatedRegionOverviewBehaviorTreatPatientsComponent } from './tabs/behavior-tab/behaviors/treat-patients/simulated-region-overview-behavior-treat-patients.component';
import { SimulatedRegionOverviewBehaviorAssignLeaderComponent } from './tabs/behavior-tab/behaviors/assign-leader/simulated-region-overview-behavior-assign-leader.component';
import { BehaviorToGermanNamePipe } from './tabs/behavior-tab/utils/behavior-to-german-name.pipe';
import { SimulatedRegionOverviewBehaviorUnloadArrivingVehiclesComponent } from './tabs/behavior-tab/behaviors/unload-arriving-vehicles/simulated-region-overview-behavior-unload-arriving-vehicles.component';
import { WithDollarPipe } from './tabs/general-tab/utils/with-dollar';
import { SimulatedRegionsModalComponent } from './simulated-regions-modal/simulated-regions-modal.component';
import { SimulatedRegionNameComponent } from './simulated-region-name/simulated-region-name.component';

@NgModule({
    declarations: [
        SimulatedRegionNameComponent,
        SimulatedRegionOverviewGeneralComponent,
        SimulatedRegionOverviewBehaviorTabComponent,
        SimulatedRegionOverviewGeneralTabComponent,
        SimulatedRegionOverviewBehaviorTreatPatientsComponent,
        SimulatedRegionOverviewBehaviorAssignLeaderComponent,
        SimulatedRegionOverviewBehaviorUnloadArrivingVehiclesComponent,
        BehaviorToGermanNamePipe,
        WithDollarPipe,
        SimulatedRegionsModalComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        NgbNavModule,
        NgbCollapseModule,
        NgbDropdownModule,
        TransferPointOverviewModule,
    ],
    exports: [SimulatedRegionOverviewGeneralComponent],
})
export class SimulatedRegionOverviewModule {}
