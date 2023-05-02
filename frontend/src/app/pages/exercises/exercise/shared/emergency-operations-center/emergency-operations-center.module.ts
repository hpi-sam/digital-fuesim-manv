import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    NgbCollapseModule,
    NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { EmergencyOperationsCenterModalComponent } from './emergency-operations-center-modal/emergency-operations-center-modal.component';
import { SendAlarmGroupInterfaceComponent } from './send-alarm-group-interface/send-alarm-group-interface.component';
import { EocLogInterfaceComponent } from './eoc-log-interface/eoc-log-interface.component';
import { TransferTargetDropdownComponent } from './transfer-target-dropdown/transfer-target-dropdown.component';

@NgModule({
    declarations: [
        EmergencyOperationsCenterModalComponent,
        SendAlarmGroupInterfaceComponent,
        EocLogInterfaceComponent,
        TransferTargetDropdownComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        NgbDropdownModule,
        NgbCollapseModule,
    ],
})
export class EmergencyOperationsCenterModule {}
