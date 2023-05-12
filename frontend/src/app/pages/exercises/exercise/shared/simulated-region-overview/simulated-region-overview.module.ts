import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
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
import { BehaviorTypeToGermanNamePipe } from './tabs/behavior-tab/utils/behavior-to-german-name.pipe';
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
import { RadiogramCardContentPatientCountComponent } from './radiogram-list/radiogram-card/radiogram-card-content-patient-count/radiogram-card-content-patient-count.component';
import { RadiogramCardContentPersonnelCountComponent } from './radiogram-list/radiogram-card/radiogram-card-content-personnel-count/radiogram-card-content-personnel-count.component';
import { RadiogramCardContentVehicleCountComponent } from './radiogram-list/radiogram-card/radiogram-card-content-vehicle-count/radiogram-card-content-vehicle-count.component';
import { SimulatedRegionOverviewBehaviorReportComponent } from './tabs/behavior-tab/behaviors/report/simulated-region-overview-behavior-report.component';
import { RadiogramCardContentInformationUnavailableComponent } from './radiogram-list/radiogram-card/radiogram-card-content-information-unavailable/radiogram-card-content-information-unavailable.component';
import { HumanReadableRadiogramTypePipe } from './radiogram-list/human-readable-radiogram-type.pipe';
import { TreatmentStatusBadgeComponent } from './treatment-status-badge/treatment-status-badge.component';
import { RadigoramCardContentMissingTransferConnectionComponent } from './radiogram-list/radiogram-card/radigoram-card-content-missing-transfer-connection/radigoram-card-content-missing-transfer-connection.component';
import { SimulatedRegionOverviewBehaviorProvidePersonnelComponent } from './tabs/behavior-tab/behaviors/provide-personnel/simulated-region-overview-behavior-provide-personnel.component';
import { SimulatedRegionOverviewBehaviorAnswerVehicleRequestsComponent } from './tabs/behavior-tab/behaviors/answer-vehicle-requests/simulated-region-overview-behavior-answer-vehicle-requests.component';
import { RadigoramCardContentResourceRequestComponent } from './radiogram-list/radiogram-card/radigoram-card-content-resource-request/radigoram-card-content-resource-request.component';
import { SimulatedRegionOverviewBehaviorAutomaticallyDistributeVehiclesComponent } from './tabs/behavior-tab/behaviors/automatically-distribute-vehicles/simulated-region-overview-behavior-automatically-distribute-vehicles.component';
import { RequestVehiclesComponent } from './tabs/behavior-tab/behaviors/request-vehicles/simulated-region-overview-behavior-request-vehicles.component';
import { SimulatedRegionOverviewPatientInteractionBarComponent } from './tabs/patients-tab/simulated-region-overview-patient-interaction-bar/simulated-region-overview-patient-interaction-bar.component';
import { SimulatedRegionOverviewVehiclesTabComponent } from './tabs/vehicles-tab/simulated-region-overview-vehicles-tab.component';
import { SimulatedRegionOverviewPatientsTableComponent } from './patients-table/simulated-region-overview-patients-table.component';
import { StartTransferService } from './start-transfer.service';
import { SimulatedRegionOverviewBehaviorTransferVehiclesComponent } from './tabs/behavior-tab/behaviors/transfer-vehicles/simulated-region-overview-behavior-transfer-vehicles.component';
import { RadiogramCardContentTransferCountsComponent } from './radiogram-list/radiogram-card/radiogram-card-content-transfer-counts/radiogram-card-content-transfer-counts.component';
import { RadiogramCardContentTransferCategoryCompletedComponent } from './radiogram-list/radiogram-card/radiogram-card-content-transfer-category-completed/radiogram-card-content-transfer-category-completed.component';

@NgModule({
    declarations: [
        SimulatedRegionNameComponent,
        SimulatedRegionOverviewGeneralComponent,
        SimulatedRegionOverviewBehaviorTabComponent,
        SimulatedRegionOverviewGeneralTabComponent,
        SimulatedRegionOverviewBehaviorTreatPatientsComponent,
        SimulatedRegionOverviewBehaviorAssignLeaderComponent,
        SimulatedRegionOverviewBehaviorUnloadArrivingVehiclesComponent,
        BehaviorTypeToGermanNamePipe,
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
        RadiogramCardContentPatientCountComponent,
        RadiogramCardContentPersonnelCountComponent,
        RadiogramCardContentVehicleCountComponent,
        SimulatedRegionOverviewBehaviorReportComponent,
        RadiogramCardContentInformationUnavailableComponent,
        HumanReadableRadiogramTypePipe,
        TreatmentStatusBadgeComponent,
        RadigoramCardContentMissingTransferConnectionComponent,
        SimulatedRegionOverviewBehaviorProvidePersonnelComponent,
        SimulatedRegionOverviewBehaviorAnswerVehicleRequestsComponent,
        RadigoramCardContentResourceRequestComponent,
        SimulatedRegionOverviewBehaviorAutomaticallyDistributeVehiclesComponent,
        RequestVehiclesComponent,
        SimulatedRegionOverviewPatientInteractionBarComponent,
        SimulatedRegionOverviewVehiclesTabComponent,
        SimulatedRegionOverviewPatientsTableComponent,
        SimulatedRegionOverviewBehaviorTransferVehiclesComponent,
        RadiogramCardContentTransferCountsComponent,
        RadiogramCardContentTransferCategoryCompletedComponent,
    ],
    imports: [
        FormsModule,
        SharedModule,
        CommonModule,
        NgbNavModule,
        NgbCollapseModule,
        NgbDropdownModule,
        NgbProgressbarModule,
        NgbTooltipModule,
        DragDropModule,
        TransferPointOverviewModule,
    ],
    exports: [SimulatedRegionOverviewGeneralComponent],
    providers: [SelectPatientService, StartTransferService],
})
export class SimulatedRegionOverviewModule {}
