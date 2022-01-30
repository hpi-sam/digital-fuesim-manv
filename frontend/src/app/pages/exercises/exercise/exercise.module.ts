import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ExerciseComponent } from './exercise/exercise.component';
import { PatientsListComponent } from './shared/patients-list/patients-list.component';
import { ClientOverviewModule } from './shared/client-overview/client-overview.module';

@NgModule({
    declarations: [ExerciseComponent, PatientsListComponent],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        ClientOverviewModule,
    ],
    exports: [ExerciseComponent],
})
export class ExerciseModule {}
