import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AlarmGroupOverviewModalComponent } from './alarm-group-overview-modal/alarm-group-overview-modal.component';
import { AlarmGroupOverviewListComponent } from './alarm-group-overview-list/alarm-group-overview-list.component';
import { EditAlarmGroupModalComponent } from './edit-alarm-group-modal/edit-alarm-group-modal.component';
import { VehicleTemplateDisplayComponent } from './vehicle-template-display/vehicle-template-display.component';
import { EditAlarmGroupVehicleModalComponent } from './edit-alarm-group-vehicle-modal/edit-alarm-group-vehicle-modal.component';

@NgModule({
    declarations: [
        AlarmGroupOverviewModalComponent,
        AlarmGroupOverviewListComponent,
        EditAlarmGroupModalComponent,
        EditAlarmGroupVehicleModalComponent,
        VehicleTemplateDisplayComponent,
    ],
    imports: [CommonModule, SharedModule, FormsModule, NgbDropdownModule],
})
export class AlarmGroupOverviewModule {}
