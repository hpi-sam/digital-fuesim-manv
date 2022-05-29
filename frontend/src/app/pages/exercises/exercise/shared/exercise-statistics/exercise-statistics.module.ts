import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExerciseStatisticsModalComponent } from './exercise-statistics-modal/exercise-statistics-modal.component';
import { HospitalPatientsTableComponent } from './hospital-patients-table/hospital-patients-table.component';
import { StackedBarChartComponent } from './stacked-bar-chart/stacked-bar-chart.component';

@NgModule({
    declarations: [
        ExerciseStatisticsModalComponent,
        StackedBarChartComponent,
        HospitalPatientsTableComponent,
    ],
    imports: [CommonModule, NgbDropdownModule, SharedModule, MatSortModule],
})
export class ExerciseStatisticsModule {}
