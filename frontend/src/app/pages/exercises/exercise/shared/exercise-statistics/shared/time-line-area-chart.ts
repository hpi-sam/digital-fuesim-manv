import type { ChartConfiguration, ChartDataset } from 'chart.js';
import {
    CategoryScale,
    Chart,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { rgbColorPalette } from 'src/app/shared/functions/colors';

Chart.register(
    CategoryScale,
    LinearScale,
    LineElement,
    LineController,
    PointElement,
    Tooltip,
    Legend,
    Filler
);

type Data = number | null;

export class TimeLineAreaChart {
    // TODO: Set this to 0.75, for this `fill` must be set to 'stack'
    public static readonly backgroundAlpha = 1;
    public readonly chart: Chart<'line', Data[], string>;

    constructor(canvas: HTMLCanvasElement) {
        this.chart = new Chart<'line', Data[], string>(
            canvas,
            this.canvasConfig
        );
    }

    public setChartData(
        newLabels: string[],
        newDatasets: ChartDataset<'line', Data[]>[]
    ) {
        this.chart.data.labels = newLabels;

        // Replacing the current datasets with new ones resets the chart and causes problems https://stackoverflow.com/a/58118273
        // So we mutate the current datasets instead

        // Remove all datasets that are no longer present
        this.chart.data.datasets.splice(newDatasets.length);
        // Add new datasets and update the values of the existing ones
        newDatasets.forEach((newDataset, index) => {
            if (!this.chart.data.datasets[index]) {
                this.chart.data.datasets[index] = newDataset;
                return;
            }
            const oldDataset = this.chart.data.datasets[index];
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
    private readonly canvasConfig: ChartConfiguration<'line', Data[], string> =
        {
            type: 'line',
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
                    line: {
                        pointRadius: 0,
                        // We only fill the area below the line
                        borderWidth: 0,
                        showLine: false,
                        // TODO: Change this to `fill: 'stack'`, currently there are artifacts (triangles when the values chaneg)
                        fill: 'origin',
                        stepped: 'after',
                        // The data must be unique, sorted, and consistent
                        normalized: false,
                    },
                },
                // This can improve the performance
                spanGaps: true,
            },
        };
}
