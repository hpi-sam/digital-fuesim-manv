import type { ChartConfiguration, ChartDataset } from 'chart.js';
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js';
import { rgbColorPalette } from 'src/app/shared/functions/colors';

Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    Tooltip,
    Legend
);

type Data = number | null;

export type StackedBarChartDatasets = ChartDataset<'bar', Data[]>[];

export class StackedBarChart {
    public static readonly backgroundAlpha = 0.8;
    public readonly chart: Chart<'bar', Data[], string>;

    constructor(canvas: HTMLCanvasElement) {
        this.chart = new Chart<'bar', Data[], string>(
            canvas,
            this.canvasConfig
        );
    }

    public setChartData(
        newLabels: string[],
        newDatasets: StackedBarChartDatasets
    ) {
        this.chart.data.labels = newLabels;

        // Replacing the current datasets with new ones resets the chart and causes problems https://stackoverflow.com/a/58118273
        // So we mutate the current datasets instead

        // Remove all datasets that are no longer present
        this.chart.data.datasets.splice(newDatasets.length);
        // Add new datasets and update the values of the existing ones
        newDatasets.forEach((newDataset, index) => {
            const oldDataset = this.chart.data.datasets[index];
            if (!oldDataset) {
                this.chart.data.datasets[index] = newDataset;
                return;
            }
            // Remove all properties
            Object.keys(oldDataset).forEach((key) => {
                delete oldDataset[key as keyof ChartDataset];
            });
            // Add the properties from the new dataset
            Object.assign(oldDataset, newDataset);
        });

        this.chart.update();
    }

    public destroy() {
        this.chart.destroy();
    }

    // It causes problems if this object is shared between multiple charts.
    private readonly canvasConfig: ChartConfiguration<'bar', Data[], string> = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [],
        },
        options: {
            transitions: {
                // Disable the clunky animations for showing and hiding datasets
                hide: {
                    animation: {
                        duration: 0,
                    },
                },
                show: {
                    animation: {
                        duration: 0,
                    },
                },
            },
            plugins: {
                tooltip: {
                    position: 'nearest',
                    mode: 'index',
                    callbacks: {
                        label: (tooltipItem) =>
                            `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}`,
                    },
                },
                legend: {
                    display: true,
                    labels: {
                        color: rgbColorPalette.black,
                    },
                },
                filler: {
                    propagate: false,
                },
            },
            responsive: true,
            interaction: {
                intersect: false,
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        maxTicksLimit: 10,
                    },
                },
                y: {
                    stacked: 'single',
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        major: {
                            enabled: true,
                        },
                    },
                },
            },
            datasets: {
                bar: {
                    categoryPercentage: 1,
                    barPercentage: 1,
                    // The data must be unique, sorted, and consistent
                    normalized: false,
                },
            },
        },
    };
}
