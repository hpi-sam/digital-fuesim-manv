import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExerciseMapComponent } from './exercise-map.component';
import { VehiclePopupComponent } from './shared/vehicle-popup/vehicle-popup.component';
import { PatientPopupComponent } from './shared/patient-popup/patient-popup.component';
import { TransferPointPopupComponent } from './shared/transfer-point-popup/transfer-point-popup.component';

@NgModule({
    declarations: [
        ExerciseMapComponent,
        VehiclePopupComponent,
        PatientPopupComponent,
        TransferPointPopupComponent,
    ],
    imports: [CommonModule, FormsModule, SharedModule],
    exports: [ExerciseMapComponent],
})
export class ExerciseMapModule {}
