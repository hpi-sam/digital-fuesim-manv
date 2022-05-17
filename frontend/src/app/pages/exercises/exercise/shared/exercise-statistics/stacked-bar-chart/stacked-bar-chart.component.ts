import type { AfterViewInit, OnChanges, OnDestroy } from '@angular/core';
import { Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import type { SimpleChangesGeneric } from 'src/app/shared/types/simple-changes-generic';
import type { StackedBarChartDatasets } from './time-line-area-chart';
import { StackedBarChart } from './time-line-area-chart';

@Component({
    selector: 'app-stacked-bar-chart',
    templateUrl: './stacked-bar-chart.component.html',
    styleUrls: ['./stacked-bar-chart.component.scss'],
})
export class StackedBarChartComponent
    implements AfterViewInit, OnChanges, OnDestroy
{
    @Input() statistics!: {
        labels: string[];
        datasets: StackedBarChartDatasets;
    };

    @ViewChild('chart', { static: true })
    chartCanvas!: ElementRef<HTMLCanvasElement>;

    constructor(private readonly ngZone: NgZone) {}

    private chart?: StackedBarChart;

    ngAfterViewInit() {
        // Run outside angular zone for improved performance
        this.ngZone.runOutsideAngular(() => {
            this.chart = new StackedBarChart(this.chartCanvas.nativeElement);
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

export interface StackedBarChartStatistics {
    labels: string[];
    datasets: StackedBarChartDatasets;
}
