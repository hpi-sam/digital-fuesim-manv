import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalModule } from '@angular/cdk/portal';
import { ExerciseMapComponent } from './exercise-map.component';
import { VehiclePopupComponent } from './shared/vehicle-popup/vehicle-popup.component';

@NgModule({
    declarations: [ExerciseMapComponent, VehiclePopupComponent],
    imports: [CommonModule, PortalModule],
    exports: [ExerciseMapComponent],
})
export class ExerciseMapModule {}
