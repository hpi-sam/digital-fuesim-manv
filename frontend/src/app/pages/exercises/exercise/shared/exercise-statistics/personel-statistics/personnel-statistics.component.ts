import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, ElementRef, ViewChild } from '@angular/core';
import type { PersonnelType } from 'digital-fuesim-manv-shared';
import { Subject, takeUntil } from 'rxjs';
import { getRgbaColor } from 'src/app/shared/functions/colors';
import { formatDuration } from 'src/app/shared/functions/format-duration';
import type { AreaStatisticsEntry } from '../area-statistics.service';
import { AreaStatisticsService } from '../area-statistics.service';
import { decimateStatistics } from '../shared/decimate-statistics';
import { TimeLineAreaChart } from '../shared/time-line-area-chart';

@Component({
    selector: 'app-personnel-statistics',
    templateUrl: './personnel-statistics.component.html',
    styleUrls: ['./personnel-statistics.component.scss'],
})
export class PersonnelStatisticsComponent implements AfterViewInit, OnDestroy {
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

    private setChartData(statistics: AreaStatisticsEntry[]) {
        const datasets = Object.entries(this.personnelColors).map(
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
