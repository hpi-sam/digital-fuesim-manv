import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
    generateRandomRgbaColor,
    getRgbaColor,
    rgbColorPalette,
} from 'src/app/shared/functions/colors';
import { formatDuration } from 'src/app/shared/functions/format-duration';
import type { AreaStatisticsEntry } from '../area-statistics.service';
import { AreaStatisticsService } from '../area-statistics.service';
import { decimateStatistics } from '../shared/decimate-statistics';
import { TimeLineAreaChart } from '../shared/time-line-area-chart';

@Component({
    selector: 'app-vehicle-statistics',
    templateUrl: './vehicle-statistics.component.html',
    styleUrls: ['./vehicle-statistics.component.scss'],
})
export class VehicleStatisticsComponent implements AfterViewInit, OnDestroy {
    @ViewChild('chart', { static: true })
    chartCanvas!: ElementRef<HTMLCanvasElement>;

    private readonly destroy$ = new Subject<void>();
    constructor(
        private readonly areaStatisticsService: AreaStatisticsService
    ) {}

    private chart?: TimeLineAreaChart;
    ngAfterViewInit() {
        this.chart = new TimeLineAreaChart(this.chartCanvas.nativeElement);
        this.areaStatisticsService.areaStatistics$
            .pipe(takeUntil(this.destroy$))
            .subscribe((areaStatistics) => {
                this.setChartData(decimateStatistics(areaStatistics));
            });
    }

    private setChartData(statistics: AreaStatisticsEntry[]) {
        // Get all vehicle types
        const vehicleTypes = new Set<string>();
        for (const statistic of statistics) {
            for (const vehicleType of Object.keys(statistic.value.vehicles)) {
                vehicleTypes.add(vehicleType);
            }
        }

        const datasets = [...vehicleTypes].map((vehicleType, index) => ({
            label: vehicleType,
            data: statistics.map(
                (statisticEntry) =>
                    statisticEntry.value.vehicles[vehicleType] ?? null
            ),
            backgroundColor: this.getColor(index),
        }));
        const labels = statistics.map(({ exerciseTime }) =>
            formatDuration(exerciseTime)
        );
        this.chart?.setChartData(labels, datasets);
    }

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

    ngOnDestroy() {
        this.chart?.destroy();
        this.destroy$.next();
    }
}
