import type { AfterViewInit, OnChanges, OnDestroy } from '@angular/core';
import { Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import type { SimpleChangesGeneric } from 'src/app/shared/types/simple-changes-generic';
import type { TimeLineAreaChartDatasets } from './time-line-area-chart';
import { TimeLineAreaChart } from './time-line-area-chart';

@Component({
    selector: 'app-time-line-area-chart',
    templateUrl: './time-line-area-chart.component.html',
    styleUrls: ['./time-line-area-chart.component.scss'],
})
export class TimeLineAreaChartComponent
    implements AfterViewInit, OnChanges, OnDestroy
{
    @Input() statistics!: {
        labels: string[];
        datasets: TimeLineAreaChartDatasets;
    };

    @ViewChild('chart', { static: true })
    chartCanvas!: ElementRef<HTMLCanvasElement>;

    constructor(private readonly ngZone: NgZone) {}

    private chart?: TimeLineAreaChart;

    ngAfterViewInit() {
        // Run outside angular zone for improved performance
        this.ngZone.runOutsideAngular(() => {
            this.chart = new TimeLineAreaChart(this.chartCanvas.nativeElement);
        });
        this.updateChartData();
    }

    ngOnChanges(changes: SimpleChangesGeneric<this>) {
        if (changes.statistics) {
            this.updateChartData();
        }
    }

    private updateChartData() {
        this.ngZone.runOutsideAngular(() => {
            this.chart?.setChartData(
                this.statistics.labels,
                this.statistics.datasets
            );
        });
    }

    ngOnDestroy() {
        this.chart?.destroy();
    }
}

export interface TimeLineAreaChartStatistics {
    labels: string[];
    datasets: TimeLineAreaChartDatasets;
}
