import { isEqual } from 'lodash-es';
import { printError } from './print-error';
import { Step } from './step';

/**
 * A benchmark step is time measured and run multiple times
 * The printed out value is the time it took to run the benchmark
 */
export class BenchmarkStep<
    State extends { [key in Name]?: BenchmarkStepValue<any> | undefined },
    Name extends keyof State = keyof State,
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
        console.log('Start benchmark', this.name);
        const runBenchmarkOnce = () => {
            const startTime = performance.now();
            const result = this.benchmark(stepState);
            const endTime = performance.now();
            return {
                result,
                time: endTime - startTime,
            };
        };
        let timeSum = 0;
        let previousBenchmarkResult: Value | undefined;
        for (let i = 0; i < this.numberOfIterations; i++) {
            console.log(`iteration ${i + 1} of ${this.numberOfIterations}`);
            const { time, result } = runBenchmarkOnce();
            if (i !== 0 && !isEqual(previousBenchmarkResult, result)) {
                printError('Benchmark is not deterministic!');
            }
            previousBenchmarkResult = result;
            timeSum += time;
        }
        return {
            value: previousBenchmarkResult!,
            time: timeSum / this.numberOfIterations,
            // TODO: I couldn't get the typings to work here correctly
        } as unknown as NonNullable<State[Name]>;
    }

    protected formatValue(value: BenchmarkStepValue<Value>) {
        return `${Math.round(value.time)}ms`;
    }
}

export interface BenchmarkStepValue<T> {
    value: T;
    time: number;
}
