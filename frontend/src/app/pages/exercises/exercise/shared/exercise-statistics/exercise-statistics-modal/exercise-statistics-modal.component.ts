import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { PatientStatus, PersonnelType } from 'digital-fuesim-manv-shared';
import { statusNames } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import {
    generateRandomRgbaColor,
    getRgbaColor,
    rgbColorPalette,
} from 'src/app/shared/functions/colors';
import { formatDuration } from 'src/app/shared/functions/format-duration';
import type { AppState } from 'src/app/state/app.state';
import { selectViewports } from 'src/app/state/exercise/exercise.selectors';
import { AreaStatisticsService } from '../area-statistics.service';
import { TimeLineAreaChart } from '../time-line-area-chart/time-line-area-chart';
import type { TimeLineAreaChartStatistics } from '../time-line-area-chart/time-line-area-chart.component';

@Component({
    selector: 'app-exercise-statistics-modal',
    templateUrl: './exercise-statistics-modal.component.html',
    styleUrls: ['./exercise-statistics-modal.component.scss'],
})
export class ExerciseStatisticsModalComponent {
    public viewports$ = this.store.select(selectViewports);

    constructor(
        public activeModal: NgbActiveModal,
        private readonly store: Store<AppState>,
        public readonly areaStatisticsService: AreaStatisticsService
    ) {}

    public close() {
        this.activeModal.close();
    }

    // Patient statistics
    private readonly patientColors: {
        [key in PatientStatus]: string;
    } = {
        // The order is important (the first key is at the bottom of the chart)
        // The colors are taken from bootstrap
        black: getRgbaColor('black', TimeLineAreaChart.backgroundAlpha),
        blue: getRgbaColor('blue', TimeLineAreaChart.backgroundAlpha),
        red: getRgbaColor('red', TimeLineAreaChart.backgroundAlpha),
        yellow: getRgbaColor('yellow', TimeLineAreaChart.backgroundAlpha),
        green: getRgbaColor('green', TimeLineAreaChart.backgroundAlpha),
        white: getRgbaColor('white', TimeLineAreaChart.backgroundAlpha),
    };

    public patientsStatistics$: Observable<TimeLineAreaChartStatistics> =
        this.areaStatisticsService.decimatedAreaStatistics$.pipe(
            map((statistics) => ({
                datasets: Object.entries(this.patientColors).map(
                    ([status, backgroundColor]) => ({
                        label: statusNames[status as PatientStatus],
                        data: statistics.map(
                            (statisticEntry) =>
                                statisticEntry.value.patients[
                                    status as PatientStatus
                                ] ?? null
                        ),
                        backgroundColor,
                    })
                ),
                labels: statistics.map(({ exerciseTime }) =>
                    formatDuration(exerciseTime)
                ),
            }))
        );

    // Vehicle statistics
    private readonly colorKeys = Object.keys(
        rgbColorPalette
    ) as (keyof typeof rgbColorPalette)[];

    private getColor(index: number) {
        if (index >= this.colorKeys.length) {
            return generateRandomRgbaColor(TimeLineAreaChart.backgroundAlpha);
        }
        return getRgbaColor(
            this.colorKeys[index],
            TimeLineAreaChart.backgroundAlpha
        );
    }

    public vehiclesStatistics$: Observable<TimeLineAreaChartStatistics> =
        this.areaStatisticsService.decimatedAreaStatistics$.pipe(
            map((statistics) => {
                // Get all vehicle types
                const vehicleTypes = new Set<string>();
                for (const statistic of statistics) {
                    for (const vehicleType of Object.keys(
                        statistic.value.vehicles
                    )) {
                        vehicleTypes.add(vehicleType);
                    }
                }

                return {
                    datasets: [...vehicleTypes].map((vehicleType, index) => ({
                        label: vehicleType,
                        data: statistics.map(
                            (statisticEntry) =>
                                statisticEntry.value.vehicles[vehicleType] ??
                                null
                        ),
                        backgroundColor: this.getColor(index),
                    })),
                    labels: statistics.map(({ exerciseTime }) =>
                        formatDuration(exerciseTime)
                    ),
                };
            })
        );

    // Personnel statistics
    private readonly personnelColors: {
        [key in PersonnelType]: string;
    } = {
        // The order is important (the first key is at the bottom of the chart)
        // The colors are taken from bootstrap
        notarzt: getRgbaColor('red', TimeLineAreaChart.backgroundAlpha),
        gf: getRgbaColor('blue', TimeLineAreaChart.backgroundAlpha),
        notSan: getRgbaColor('green', TimeLineAreaChart.backgroundAlpha),
        rettSan: getRgbaColor('purple', TimeLineAreaChart.backgroundAlpha),
        san: getRgbaColor('yellow', TimeLineAreaChart.backgroundAlpha),
    };

    public personnelStatistics$: Observable<TimeLineAreaChartStatistics> =
        this.areaStatisticsService.decimatedAreaStatistics$.pipe(
            map((statistics) => ({
                datasets: Object.entries(this.personnelColors).map(
                    ([personnelType, backgroundColor]) => ({
                        label: personnelType,
                        data: statistics.map(
                            (statisticEntry) =>
                                statisticEntry.value.personnel[
                                    personnelType as PersonnelType
                                ] ?? null
                        ),
                        backgroundColor,
                    })
                ),
                labels: statistics.map(({ exerciseTime }) =>
                    formatDuration(exerciseTime)
                ),
            }))
        );
}
