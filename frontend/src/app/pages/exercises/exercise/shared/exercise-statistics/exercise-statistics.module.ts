import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExerciseStatisticsModalComponent } from './exercise-statistics-modal/exercise-statistics-modal.component';
import { TimeLineAreaChartComponent } from './time-line-area-chart/time-line-area-chart.component';

@NgModule({
    declarations: [
        ExerciseStatisticsModalComponent,
        TimeLineAreaChartComponent,
    ],
    imports: [CommonModule, NgbDropdownModule, SharedModule],
})
export class ExerciseStatisticsModule {}
