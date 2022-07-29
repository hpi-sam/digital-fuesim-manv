import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MessagesModule } from 'src/app/feature/messages/messages.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExerciseMapComponent } from './exercise-map.component';
import { ChooseTransferTargetPopupComponent } from './shared/choose-transfer-target-popup/choose-transfer-target-popup.component';
import { MapImagePopupComponent } from './shared/map-image-popup/map-image-popup.component';
import { PatientPopupComponent } from './shared/patient-popup/patient-popup.component';
import { TransferPointPopupComponent } from './shared/transfer-point-popup/transfer-point-popup.component';
import { VehiclePopupComponent } from './shared/vehicle-popup/vehicle-popup.component';
import { ViewportPopupComponent } from './shared/viewport-popup/viewport-popup.component';

@NgModule({
    declarations: [
        ExerciseMapComponent,
        VehiclePopupComponent,
        MapImagePopupComponent,
        PatientPopupComponent,
        TransferPointPopupComponent,
        ViewportPopupComponent,
        ChooseTransferTargetPopupComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        NgbDropdownModule,
        NgbNavModule,
        MessagesModule,
    ],
    exports: [ExerciseMapComponent],
})
export class ExerciseMapModule {}
