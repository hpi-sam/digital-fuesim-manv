import type { ExerciseAction } from 'digital-fuesim-manv-shared';

export interface ActionTimeRecord {
    ctx: {
        // action type
        type: ExerciseAction['type'];
        stage?: 'apply' | 'receive';
    };
    ms: number;
}

export class ActionTiming {
    _timings: ActionTimeRecord[] = [];

    get sampleCount() {
        return this.series().reduce((a, b) => Math.max(a, b.times.length), 0);
    }

    add(time: number, context: ActionTimeRecord['ctx']) {
        this._timings.push({
            ms: time,
            ctx: context,
        });
    }

    measureWrap<FuncType extends (...args: any) => any>(
        f: (...args: Parameters<FuncType>) => ReturnType<FuncType>,
        contextExtractor: (
            args: Parameters<FuncType>,
            ret: ReturnType<FuncType>
        ) => ActionTimeRecord['ctx']
    ) {
        return (...args: Parameters<FuncType>) => {
            const beforeProcessing = performance.now();
            const ret = f(...args);
            const afterProcessing = performance.now();
            this.add(
                afterProcessing - beforeProcessing,
                contextExtractor(args, ret)
            );
        };
    }

    clear() {
        this._timings = [];
    }

    series(seriesLimit?: number) {
        const series: { ctx: ActionTimeRecord['ctx']; times: number[] }[] = [];
        this._timings.forEach(({ ctx, ms }) => {
            let s = series.find(
                (a) => a.ctx.stage === ctx.stage && a.ctx.type === ctx.type
            );
            if (!s) {
                s = { ctx, times: [] };
                series.push(s);
            }
            if (!seriesLimit || s.times.length < seriesLimit) {
                s.times.push(ms);
            }
        });
        return series;
    }

    series_stats(seriesLimit?: number) {
        const series = this.series(seriesLimit);
        return series.map(({ ctx, times }) => ({
            ctx,
            stats: this.stat(times),
        }));
    }

    stat(times: number[]) {
        const plus = (a: number, b: number) => a + b;
        const count = times.length;
        const total = times.reduce(plus, 0);
        const avg = total / count;
        const stddev =
            times.map((a) => (a * a) / count).reduce(plus, 0) - avg * avg;
        const variance = Math.sqrt(stddev);
        times.sort((a, b) => a - b);

        const max = times[count - 1];
        const min = times[0];
        const med =
            (times[Math.floor((count - 1) / 2)]! +
                times[Math.ceil((count - 1) / 2)]!) /
            2;
        return {
            count,
            total,
            avg,
            stddev,
            variance,
            min,
            med,
            max,
        };
    }

    raw() {
        return structuredClone(this._timings) as typeof this._timings;
    }

    table() {
        console.table(this.series_stats());
    }
}

export const actionTiming = new ActionTiming();
