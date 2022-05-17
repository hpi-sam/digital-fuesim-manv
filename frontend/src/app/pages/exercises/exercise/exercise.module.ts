import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExerciseComponent } from './exercise/exercise.component';
import { ClientOverviewModule } from './shared/client-overview/client-overview.module';
import { ExerciseMapModule } from './shared/exercise-map/exercise-map.module';
import { TrainerMapEditorComponent } from './shared/trainer-map-editor/trainer-map-editor.component';
import { TrainerToolbarComponent } from './shared/trainer-toolbar/trainer-toolbar.component';
import { ExerciseStateBadgeComponent } from './shared/exercise-state-badge/exercise-state-badge.component';
import { TransferOverviewModule } from './shared/transfer-overview/transfer-overview.module';
import { ExerciseSettingsModalComponent } from './shared/exercise-settings/exercise-settings-modal/exercise-settings-modal.component';
import { AlarmGroupOverviewModule } from './shared/alarm-group-overview/alarm-group-overview.module';

@NgModule({
    declarations: [
        ExerciseComponent,
        TrainerMapEditorComponent,
        TrainerToolbarComponent,
        ExerciseStateBadgeComponent,
        ExerciseSettingsModalComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        HttpClientModule,
        ClientOverviewModule,
        ExerciseMapModule,
        TransferOverviewModule,
        AlarmGroupOverviewModule,
    ],
    exports: [ExerciseComponent],
})
export class ExerciseModule {}
