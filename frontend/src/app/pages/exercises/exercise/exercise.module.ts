import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExerciseComponent } from './exercise/exercise.component';
import { AlarmGroupOverviewModule } from './shared/alarm-group-overview/alarm-group-overview.module';
import { ClientOverviewModule } from './shared/client-overview/client-overview.module';
import { CreateImageTemplateModalComponent } from './shared/editor-panel/create-image-template-modal/create-image-template-modal.component';
import { EditImageTemplateModalComponent } from './shared/editor-panel/edit-image-template-modal/edit-image-template-modal.component';
import { ImageTemplateFormComponent } from './shared/editor-panel/image-template-form/image-template-form.component';
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

@NgModule({
    declarations: [
        ExerciseComponent,
        TrainerMapEditorComponent,
        TrainerToolbarComponent,
        ExerciseStateBadgeComponent,
        ExerciseSettingsModalComponent,
        TimeTravelComponent,
        CreateImageTemplateModalComponent,
        EditImageTemplateModalComponent,
        ImageTemplateFormComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        NgbDropdownModule,
        FormsModule,
        HttpClientModule,
        ClientOverviewModule,
        ExerciseStatisticsModule,
        ExerciseMapModule,
        TransferOverviewModule,
        AlarmGroupOverviewModule,
        HospitalEditorModule,
        EmergencyOperationsCenterModule,
    ],
    exports: [ExerciseComponent],
})
export class ExerciseModule {}
