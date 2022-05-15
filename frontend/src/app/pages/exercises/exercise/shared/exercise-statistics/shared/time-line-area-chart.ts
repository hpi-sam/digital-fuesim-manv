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
        labels: string[],
        datasets: ChartDataset<'line', Data[]>[]
    ) {
        // TODO: optimise by updating the values in place
        this.chart.data.labels = labels;
        this.chart.data.datasets = datasets;
        // We don't want to animate this
        this.chart.update('none');
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
                            color: 'rgb(33, 37, 41)',
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
