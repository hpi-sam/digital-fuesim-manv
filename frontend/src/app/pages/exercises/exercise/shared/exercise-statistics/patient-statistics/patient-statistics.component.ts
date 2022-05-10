import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, ElementRef, ViewChild } from '@angular/core';
import type { ChartDataset } from 'chart.js';
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    LinearScale,
} from 'chart.js';
import type { PatientStatus } from 'digital-fuesim-manv-shared';
import { statusNames } from 'digital-fuesim-manv-shared';
import type { AreaStatistics } from 'digital-fuesim-manv-shared/dist/models/utils/area-statistics';
import { Subject, takeUntil } from 'rxjs';
import { AreaStatisticsService } from '../area-statistics.service';

// TODO: Is this the right place for that?
Chart.register(CategoryScale, LinearScale, BarController, BarElement);

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

    private chart?: Chart;

    ngAfterViewInit() {
        this.chart = new Chart(this.chartCanvas.nativeElement, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [],
            },
            options: {
                plugins: {},
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        // TODO: a time scale? Time adapter needed
                        // type: 'time',
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            major: {
                                enabled: true,
                            },
                        },
                    },
                },
            },
        });
        this.areaStatisticsService.areaStatistics$
            .pipe(takeUntil(this.destroy$))
            .subscribe((areaStatistics) => {
                this.setChartData(areaStatistics);
            });
    }

    private readonly patientColors: {
        [key in PatientStatus]: string;
    } = {
        // The order is important
        // The colors are taken from bootstrap
        white: 'rgba(248, 249, 250, 0.75)',
        green: 'rgba(25, 135, 84, 0.75)',
        yellow: 'rgba(255, 193, 7, 0.75)',
        red: 'rgba(220, 53, 69, 0.75)',
        blue: 'rgba(13, 110, 253, 0.75)',
        black: 'rgba(33, 37, 41, 0.75)',
    };

    private setChartData(statistics: AreaStatistics[]) {
        const datasets: ChartDataset<'bar', number[]>[] = Object.entries(
            this.patientColors
        ).map(([status, backgroundColor]) => ({
            label: statusNames[status as PatientStatus],
            data: statistics.map(
                (statisticEntry) =>
                    statisticEntry.patients[status as PatientStatus] ?? 0
            ),
            backgroundColor,
            categoryPercentage: 1,
            // The data must be unique, sorted, and consistent
            normalized: true,
            barPercentage: 1,
        }));
        this.chart!.data.datasets = datasets;
        this.chart!.data.labels = statistics.map(
            (entry, index) => `${Math.round(index / 60)} min`
        );
        // We don't want to animate this
        this.chart?.update('none');
    }

    ngOnDestroy() {
        this.chart?.destroy();
        this.destroy$.next();
    }
}
