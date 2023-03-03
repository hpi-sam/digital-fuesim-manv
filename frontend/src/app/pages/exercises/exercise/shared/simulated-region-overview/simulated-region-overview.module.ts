import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
<<<<<<< HEAD
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
=======
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
>>>>>>> 6aee139aa34c45077fc89df8258dae67732f9e55
import { SimulatedRegionOverviewGeneralComponent } from './overview/simulated-region-overview.component';
import { SimulatedRegionOverviewBehaviorTabComponent } from './tabs/behavior-tab/simulated-region-overview-behavior-tab.component';
import { SimulatedRegionOverviewGeneralTabComponent } from './tabs/general-tab/simulated-region-overview-general-tab.component';
import { SimulatedRegionOverviewTransferTabComponent } from './tabs/transfer-tab/simulated-region-overview-transfer-tab.component';
<<<<<<< HEAD
import { SimulatedRegionOverviewBehaviorTreatPatientsComponent } from './tabs/behavior-tab/behaviors/treat-patients/simulated-region-overview-behavior-treat-patients.component';
import { SimulatedRegionOverviewBehaviorAssignLeaderComponent } from './tabs/behavior-tab/behaviors/assign-leader/simulated-region-overview-behavior-assign-leader.component';
import { SimulatedRegionOverviewBehaviorUnloadArrivingVehiclesComponent } from './tabs/behavior-tab/behaviors/x/simulated-region-overview-behavior-unload-arriving-vehicles.component';
import { BehaviorToGermanNamePipe } from './tabs/behavior-tab/utils/behavior-to-german-name.pipe';
=======
>>>>>>> 6aee139aa34c45077fc89df8258dae67732f9e55

@NgModule({
    declarations: [
        SimulatedRegionOverviewGeneralComponent,
        SimulatedRegionOverviewBehaviorTabComponent,
        SimulatedRegionOverviewGeneralTabComponent,
        SimulatedRegionOverviewTransferTabComponent,
<<<<<<< HEAD
        SimulatedRegionOverviewBehaviorTreatPatientsComponent,
        SimulatedRegionOverviewBehaviorAssignLeaderComponent,
        SimulatedRegionOverviewBehaviorUnloadArrivingVehiclesComponent,
        BehaviorToGermanNamePipe,
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        NgbNavModule,
        NgbDropdownModule,
    ],
=======
    ],
    imports: [CommonModule, FormsModule, SharedModule, NgbNavModule],
>>>>>>> 6aee139aa34c45077fc89df8258dae67732f9e55
    exports: [SimulatedRegionOverviewGeneralComponent],
})
export class SimulatedRegionOverviewModule {}
