import { clientMap } from './client-map';

export class PerformanceMonitor {
    private readonly measurementInterval = 5000;
    private numberOfReceivedMessages = 0;
    private numberOfSendMessages = 0;
    private readonly responsivenessMonitor = new ResponsivenessMonitor();

    constructor() {
        setTimeout(() => this.logMeasurement(), this.measurementInterval);
    }

    public messageReceived() {
        this.numberOfReceivedMessages++;
    }

    public messageSend() {
        this.numberOfSendMessages++;
    }

    private logMeasurement() {
        const memoryUsage = process.memoryUsage();
        console.log(
            `
Time                         : ${new Date().toISOString()}
Responsiveness delay         : ${this.responsivenessMonitor.getResponsivenessDelay()} ms
Total memory (rss)           : ${this.formatBytes(memoryUsage.rss)}
Memory Heap used             : ${this.formatBytes(memoryUsage.heapUsed)}
MeasurementIntervall         : ${this.measurementInterval} ms
Number of clients            : ${clientMap.size}
Received messages            : ${this.numberOfReceivedMessages}
Send messages excl. callbacks: ${this.numberOfSendMessages}
 `
        );
        this.numberOfReceivedMessages = 0;
        this.numberOfSendMessages = 0;
        setTimeout(() => this.logMeasurement(), this.measurementInterval);
    }

    private formatBytes(bytes: number) {
        if (bytes < 1024) return `${bytes} Bytes`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        if (bytes < 1024 * 1024 * 1024)
            return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop
 */
class ResponsivenessMonitor {
    private readonly responsivenessMeasureIntervall = 500;
    private readonly responsivenessDelays = Array.from({
        length: 8,
    }).fill(null) as (number | null)[];

    constructor() {
        const timeoutStart = Date.now();
        setTimeout(
            () => this.startTimeoutMeasure(timeoutStart),
            this.responsivenessMeasureIntervall
        );
    }

    private startTimeoutMeasure(timeoutStart: number) {
        const delay =
            Date.now() - timeoutStart - this.responsivenessMeasureIntervall;
        this.responsivenessDelays.shift();
        this.responsivenessDelays.push(delay);
        const nextTimeoutStart = Date.now();
        setTimeout(
            () => this.startTimeoutMeasure(nextTimeoutStart),
            this.responsivenessMeasureIntervall
        );
    }

    /**
     * @returns the average delay by which a function on the setTimeout stack is called in ms
     * lower is better, should on the order of 10ms without any stress on the server
     */
    public getResponsivenessDelay() {
        const nonNullDelays = this.responsivenessDelays.filter(
            (delay) => delay !== null
        ) as number[];
        // average
        return nonNullDelays.reduce((a, b) => a + b, 0) / nonNullDelays.length;
    }
}
