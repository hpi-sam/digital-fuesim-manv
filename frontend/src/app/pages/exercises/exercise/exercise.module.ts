import { CommonModule } from '@angular/common';
import {
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    NgbDropdownModule,
    NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExerciseComponent } from './exercise/exercise.component';
import { AlarmGroupOverviewModule } from './shared/alarm-group-overview/alarm-group-overview.module';
import { ClientOverviewModule } from './shared/client-overview/client-overview.module';
import { CreateImageTemplateModalComponent } from './shared/editor-panel/create-image-template-modal/create-image-template-modal.component';
import { CreateVehicleTemplateModalComponent } from './shared/editor-panel/create-vehicle-template-modal/create-vehicle-template-modal.component';
import { EditImageTemplateModalComponent } from './shared/editor-panel/edit-image-template-modal/edit-image-template-modal.component';
import { EditVehicleTemplateModalComponent } from './shared/editor-panel/edit-vehicle-template-modal/edit-vehicle-template-modal.component';
import { ImageTemplateFormComponent } from './shared/editor-panel/image-template-form/image-template-form.component';
import { VehicleTemplateFormComponent } from './shared/editor-panel/vehicle-template-form/vehicle-template-form.component';
import { EmergencyOperationsCenterModule } from './shared/emergency-operations-center/emergency-operations-center.module';
import { ExerciseMapModule } from './shared/exercise-map/exercise-map.module';
import { ExerciseSettingsModalComponent } from './shared/exercise-settings/exercise-settings-modal/exercise-settings-modal.component';
import { ExerciseStateBadgeComponent } from './shared/exercise-state-badge/exercise-state-badge.component';
import { ExerciseStatisticsModule } from './shared/exercise-statistics/exercise-statistics.module';
import { HospitalEditorModule } from './shared/hospital-editor/hospital-editor.module';
import { TimeTravelComponent } from './shared/time-travel/time-travel.component';
import { TrainerMapEditorComponent } from './shared/trainer-map-editor/trainer-map-editor.component';
import { TrainerToolbarComponent } from './shared/trainer-toolbar/trainer-toolbar.component';
import { TransferOverviewModule } from './shared/transfer-overview/transfer-overview.module';
import { CoordinatePickerModule } from './shared/coordinate-picker/coordinate-picker.module';
import { PersonnelTemplateDisplayComponent } from './shared/editor-panel/personnel-template-display/personnel-template-display.component';
import { MaterialTemplateDisplayComponent } from './shared/editor-panel/material-template-display/material-template-display.component';

@NgModule({
    declarations: [
        ExerciseComponent,
        TrainerMapEditorComponent,
        TrainerToolbarComponent,
        ExerciseStateBadgeComponent,
        ExerciseSettingsModalComponent,
        TimeTravelComponent,
        CreateImageTemplateModalComponent,
        CreateVehicleTemplateModalComponent,
        EditImageTemplateModalComponent,
        EditVehicleTemplateModalComponent,
        ImageTemplateFormComponent,
        VehicleTemplateFormComponent,
        PersonnelTemplateDisplayComponent,
        MaterialTemplateDisplayComponent,
    ],
    exports: [ExerciseComponent],
    imports: [
        CommonModule,
        SharedModule,
        NgbDropdownModule,
        FormsModule,
        ClientOverviewModule,
        ExerciseStatisticsModule,
        ExerciseMapModule,
        TransferOverviewModule,
        AlarmGroupOverviewModule,
        HospitalEditorModule,
        EmergencyOperationsCenterModule,
        CoordinatePickerModule,
        NgbTooltipModule,
    ],
    providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class ExerciseModule {}
