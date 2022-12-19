import { isEqual } from 'lodash-es';
import { printError } from './print-error';
import { Step } from './step';

/**
 * A benchmark step is time measured and run multiple times
 * The printed out value is the time it took to run the benchmark
 */
export class BenchmarkStep<
    State extends { [key in Name]?: BenchmarkStepValue<any> | undefined },
    Name extends string & keyof State = string & keyof State,
    Value extends NonNullable<State[Name]> extends BenchmarkStepValue<infer T>
        ? T
        : never = NonNullable<State[Name]> extends BenchmarkStepValue<infer T>
        ? T
        : never
> extends Step<State, Name, State[Name]> {
    private readonly numberOfIterations = 3;

    constructor(
        name: Name,
        /**
         * Will be run multiple times and must therefore be deterministic
         */
        private readonly benchmark: (state: State) => Value
    ) {
        super(name, true);
    }

    protected runStep(stepState: State) {
        this.printStatus([], false);
        const runBenchmarkOnce = () => {
            const startTime = performance.now();
            const result = this.benchmark(stepState);
            const endTime = performance.now();
            return {
                result,
                time: endTime - startTime,
            };
        };
        const benchmarkStepValues: BenchmarkStepValue<Value>[] = [];
        for (let i = 0; i < this.numberOfIterations; i++) {
            const { time, result } = runBenchmarkOnce();
            benchmarkStepValues.push({ value: result, time });
            this.printStatus(benchmarkStepValues, true);
        }
        process.stdout.write('\n');
        if (
            benchmarkStepValues.length > 1 &&
            benchmarkStepValues.some(
                ({ value }) => !isEqual(benchmarkStepValues[0]!.value, value)
            )
        ) {
            printError('Benchmark is not deterministic!');
        }
        const endResult: BenchmarkStepValue<Value> = {
            value: benchmarkStepValues[0]!.value,
            time:
                benchmarkStepValues.reduce(
                    (timeSum, { time }) => timeSum + time,
                    0
                ) / this.numberOfIterations,
            // TODO: I couldn't get the typings to work here correctly
        };
        return endResult as NonNullable<State[Name]>;
    }

    private printStatus(
        benchmarkResults: BenchmarkStepValue<Value>[],
        overwrite: boolean
    ) {
        const statusIndicator = benchmarkResults
            .map((result) => this.formatValue(result).padEnd(10, ' '))
            .join(' ');
        if (overwrite) {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
        }
        process.stdout.write(
            `  ${`${this.name}:`.padEnd(26, ' ')} ${statusIndicator}`
        );
    }

    protected formatValue(value: BenchmarkStepValue<Value>) {
        return `${Math.round(value.time)}ms`;
    }
}

export interface BenchmarkStepValue<T> {
    value: T;
    time: number;
}
