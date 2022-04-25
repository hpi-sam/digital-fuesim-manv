import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ExerciseComponent } from './exercise/exercise.component';
import { ClientOverviewModule } from './shared/client-overview/client-overview.module';
import { ExerciseMapModule } from './shared/exercise-map/exercise-map.module';
import { TrainerMapEditorComponent } from './shared/trainer-map-editor/trainer-map-editor.component';
import { TrainerToolbarComponent } from './shared/trainer-toolbar/trainer-toolbar.component';
import { TransferOverviewModule } from './shared/transfer-overview/transfer-overview.module';

@NgModule({
    declarations: [
        ExerciseComponent,
        TrainerMapEditorComponent,
        TrainerToolbarComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        ClientOverviewModule,
        ExerciseMapModule,
        TransferOverviewModule,
    ],
    exports: [ExerciseComponent],
})
export class ExerciseModule {}
