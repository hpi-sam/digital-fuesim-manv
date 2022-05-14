import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, ElementRef, ViewChild } from '@angular/core';
import type { PatientStatus } from 'digital-fuesim-manv-shared';
import { statusNames } from 'digital-fuesim-manv-shared';
import { Subject, takeUntil } from 'rxjs';
import { getRgbaColor } from 'src/app/shared/functions/colors';
import { formatDuration } from 'src/app/shared/functions/format-duration';
import type { AreaStatisticsEntry } from '../area-statistics.service';
import { AreaStatisticsService } from '../area-statistics.service';
import { decimateStatistics } from '../shared/decimate-statistics';
import { TimeLineAreaChart } from '../shared/time-line-area-chart';

@Component({
    selector: 'app-patient-statistics',
    templateUrl: './patient-statistics.component.html',
    styleUrls: ['./patient-statistics.component.scss'],
})
export class PatientStatisticsComponent implements AfterViewInit, OnDestroy {
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

    private setChartData(statistics: AreaStatisticsEntry[]) {
        const datasets = Object.entries(this.patientColors).map(
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
        );
        const labels = statistics.map(({ exerciseTime }) =>
            formatDuration(exerciseTime)
        );
        this.chart?.setChartData(labels, datasets);
    }

    ngOnDestroy() {
        this.chart?.destroy();
        this.destroy$.next();
    }
}
