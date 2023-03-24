import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import {
    NgbCollapseModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbProgressbarModule,
    NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TransferPointOverviewModule } from '../transfer-point-overview/transfer-point-overview.module';
import { SimulatedRegionOverviewGeneralComponent } from './overview/simulated-region-overview.component';
import { SimulatedRegionOverviewBehaviorTabComponent } from './tabs/behavior-tab/simulated-region-overview-behavior-tab.component';
import { SimulatedRegionOverviewGeneralTabComponent } from './tabs/general-tab/simulated-region-overview-general-tab.component';
import { SimulatedRegionOverviewBehaviorTreatPatientsComponent } from './tabs/behavior-tab/behaviors/treat-patients/simulated-region-overview-behavior-treat-patients.component';
import { SimulatedRegionOverviewBehaviorAssignLeaderComponent } from './tabs/behavior-tab/behaviors/assign-leader/simulated-region-overview-behavior-assign-leader.component';
import { BehaviorToGermanNamePipe } from './tabs/behavior-tab/utils/behavior-to-german-name.pipe';
import { SimulatedRegionOverviewBehaviorUnloadArrivingVehiclesComponent } from './tabs/behavior-tab/behaviors/unload-arriving-vehicles/simulated-region-overview-behavior-unload-arriving-vehicles.component';
import { TreatmentProgressToGermanNamePipe } from './tabs/behavior-tab/utils/treatment-progress-to-german-name.pipe';
import { SimulatedRegionOverviewBehaviorTreatPatientsPatientDetailsComponent } from './tabs/behavior-tab/behaviors/treat-patients/patient-details/simulated-region-overview-behavior-treat-patients-patient-details.component';
import { WithDollarPipe } from './tabs/general-tab/utils/with-dollar';
import { PersonnelTypeToGermanAbbreviationPipe } from './tabs/behavior-tab/utils/personnel-type-to-german-abbreviation.pipe';
import { SimulatedRegionsModalComponent } from './simulated-regions-modal/simulated-regions-modal.component';
import { SimulatedRegionNameComponent } from './simulated-region-name/simulated-region-name.component';
import { SimulatedRegionOverviewPatientsTabComponent } from './tabs/patients-tab/simulated-region-overview-patients-tab/simulated-region-overview-patients-tab.component';
import { SelectPatientService } from './select-patient.service';
import { RadiogramListComponent } from './radiogram-list/radiogram-list.component';
import { RadiogramCardComponent } from './radiogram-list/radiogram-card/radiogram-card.component';
import { RadiogramCardContentComponent } from './radiogram-list/radiogram-card/radiogram-card-content/radiogram-card-content.component';
import { RadiogramCardContentFallbackComponent } from './radiogram-list/radiogram-card/radiogram-card-content-fallback/radiogram-card-content-fallback.component';
import { RadiogramCardContentMaterialCountComponent } from './radiogram-list/radiogram-card/radiogram-card-content-material-count/radiogram-card-content-material-count.component';
import { RadiogramCardContentTreatmentStatusComponent } from './radiogram-list/radiogram-card/radiogram-card-content-treatment-status/radiogram-card-content-treatment-status.component';
import { RadiogramCardContentPersonnelCountComponent } from './radiogram-list/radiogram-card/radiogram-card-content-personnel-count/radiogram-card-content-personnel-count.component';
import { SimulatedRegionOverviewBehaviorReportComponent } from './tabs/behavior-tab/behaviors/report/simulated-region-overview-behavior-report.component';

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
        TreatmentProgressToGermanNamePipe,
        SimulatedRegionOverviewBehaviorTreatPatientsPatientDetailsComponent,
        WithDollarPipe,
        PersonnelTypeToGermanAbbreviationPipe,
        SimulatedRegionsModalComponent,
        SimulatedRegionOverviewPatientsTabComponent,
        RadiogramListComponent,
        RadiogramCardComponent,
        RadiogramCardContentComponent,
        RadiogramCardContentFallbackComponent,
        RadiogramCardContentMaterialCountComponent,
        RadiogramCardContentTreatmentStatusComponent,
        RadiogramCardContentPersonnelCountComponent,
        SimulatedRegionOverviewBehaviorReportComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        NgbNavModule,
        NgbCollapseModule,
        NgbDropdownModule,
        NgbProgressbarModule,
        NgbTooltipModule,
        TransferPointOverviewModule,
    ],
    exports: [SimulatedRegionOverviewGeneralComponent],
    providers: [SelectPatientService],
})
export class SimulatedRegionOverviewModule {}
