import { isEqual } from 'lodash-es';
import { print } from './print';
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
        print(`  ${this.name}:`.padEnd(30, ' '));
        const benchmarkStepValues: BenchmarkStepValue<Value>[] = [];
        for (let i = 0; i < this.numberOfIterations; i++) {
            const benchmarkStepValue = this.runBenchmarkOnce(stepState);
            benchmarkStepValues.push(benchmarkStepValue);
            print(this.formatValue(benchmarkStepValue).padEnd(10, ' '));
        }
        if (
            benchmarkStepValues.length > 1 &&
            benchmarkStepValues.some(
                ({ value }) => !isEqual(benchmarkStepValues[0]!.value, value)
            )
        ) {
            print('    Not deterministic!', 'red');
        }
        print('\n');
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

    private runBenchmarkOnce(stepState: State) {
        const startTime = performance.now();
        const value = this.benchmark(stepState);
        const endTime = performance.now();
        return {
            value,
            time: endTime - startTime,
        };
    }

    protected formatValue(value: BenchmarkStepValue<Value>) {
        return `${Math.round(value.time)}ms`;
    }
}

export interface BenchmarkStepValue<T> {
    value: T;
    time: number;
}
