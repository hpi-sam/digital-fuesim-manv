import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExerciseMapComponent } from './exercise-map.component';
import { VehiclePopupComponent } from './shared/vehicle-popup/vehicle-popup.component';
import { PatientPopupComponent } from './shared/patient-popup/patient-popup.component';

@NgModule({
    declarations: [
        ExerciseMapComponent,
        VehiclePopupComponent,
        PatientPopupComponent,
    ],
    imports: [CommonModule],
    exports: [ExerciseMapComponent],
})
export class ExerciseMapModule {}
