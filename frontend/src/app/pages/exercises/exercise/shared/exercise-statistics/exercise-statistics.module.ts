import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExerciseStatisticsModalComponent } from './exercise-statistics-modal/exercise-statistics-modal.component';
import { StackedBarChartComponent } from './stacked-bar-chart/stacked-bar-chart.component';

@NgModule({
    declarations: [
        ExerciseStatisticsModalComponent,
        StackedBarChartComponent,
    ],
    imports: [CommonModule, NgbDropdownModule, SharedModule],
})
export class ExerciseStatisticsModule {}
