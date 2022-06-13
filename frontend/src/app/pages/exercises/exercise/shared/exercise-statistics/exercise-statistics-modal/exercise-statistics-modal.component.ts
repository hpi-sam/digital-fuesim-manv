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
import type { StackedBarChartStatistics } from '../stacked-bar-chart/stacked-bar-chart.component';
import { StackedBarChart } from '../stacked-bar-chart/time-line-area-chart';

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
    ) {
        this.refreshStatistics();
    }

    public close() {
        this.activeModal.close();
    }

    public refreshStatistics() {
        this.areaStatisticsService.updateStatistics();
    }

    // Patient statistics
    private readonly patientColors: {
        [key in PatientStatus]: string;
    } = {
        // The order is important (the first key is at the bottom of the chart)
        // The colors are taken from bootstrap
        black: getRgbaColor('black', StackedBarChart.backgroundAlpha),
        blue: getRgbaColor('blue', StackedBarChart.backgroundAlpha),
        red: getRgbaColor('red', StackedBarChart.backgroundAlpha),
        yellow: getRgbaColor('yellow', StackedBarChart.backgroundAlpha),
        green: getRgbaColor('green', StackedBarChart.backgroundAlpha),
        white: getRgbaColor('white', StackedBarChart.backgroundAlpha),
    };

    public patientsStatistics$: Observable<StackedBarChartStatistics> =
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
            return generateRandomRgbaColor(StackedBarChart.backgroundAlpha);
        }
        return getRgbaColor(
            this.colorKeys[index],
            StackedBarChart.backgroundAlpha
        );
    }

    public vehiclesStatistics$: Observable<StackedBarChartStatistics> =
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
    private readonly personnelConfig: {
        [key in PersonnelType]: { label: string; color: string };
    } = {
        // The order is important (the first key is at the bottom of the chart)
        // The colors are taken from bootstrap
        notarzt: {
            label: 'Notarzt',
            color: getRgbaColor('red', StackedBarChart.backgroundAlpha),
        },
        gf: {
            label: 'GF',
            color: getRgbaColor('blue', StackedBarChart.backgroundAlpha),
        },
        notSan: {
            label: 'NotSan',
            color: getRgbaColor('green', StackedBarChart.backgroundAlpha),
        },
        rettSan: {
            label: 'RettSan',
            color: getRgbaColor('purple', StackedBarChart.backgroundAlpha),
        },
        san: {
            label: 'San',
            color: getRgbaColor('yellow', StackedBarChart.backgroundAlpha),
        },
    };

    public personnelStatistics$: Observable<StackedBarChartStatistics> =
        this.areaStatisticsService.decimatedAreaStatistics$.pipe(
            map((statistics) => ({
                datasets: Object.entries(this.personnelConfig).map(
                    ([personnelType, { color, label }]) => ({
                        label,
                        data: statistics.map(
                            (statisticEntry) =>
                                statisticEntry.value.personnel[
                                    personnelType as PersonnelType
                                ] ?? null
                        ),
                        backgroundColor: color,
                    })
                ),
                labels: statistics.map(({ exerciseTime }) =>
                    formatDuration(exerciseTime)
                ),
            }))
        );
}
