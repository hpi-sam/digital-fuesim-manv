import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    NgbCollapseModule,
    NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmergencyOperationsCenterModalComponent } from './emergency-operations-center-modal/emergency-operations-center-modal.component';
import { SendAlarmGroupInterfaceComponent } from './send-alarm-group-interface/send-alarm-group-interface.component';

@NgModule({
    declarations: [
        EmergencyOperationsCenterModalComponent,
        SendAlarmGroupInterfaceComponent,
    ],
    imports: [CommonModule, SharedModule, NgbDropdownModule, NgbCollapseModule],
})
export class EmergencyOperationsCenterModule {}
