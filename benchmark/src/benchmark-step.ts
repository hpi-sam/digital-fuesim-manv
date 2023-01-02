import type { BenchmarkValue } from './benchmark';
import { benchmark } from './benchmark';
import { print } from './print';
import { Step } from './step';

/**
 * A benchmark step is time measured and run multiple times
 * The printed out value is the time it took to run the benchmark
 */
export class BenchmarkStep<
    // TS will error during transpiling with "Type parameter 'Value' has a circular constraint.",  if we use BenchmarkValue<Value> here
    State extends { [Key in Name]?: BenchmarkValue<any> | undefined },
    Name extends string & keyof State = string & keyof State,
    Value extends NonNullable<State[Name]> extends BenchmarkValue<infer T>
        ? T
        : never = NonNullable<State[Name]> extends BenchmarkValue<infer T>
        ? T
        : never
> extends Step<State, Name, State[Name]> {
    constructor(
        name: Name,
        /**
         * Will be run multiple times and must therefore be deterministic
         */
        private readonly functionToBenchmark: (state: State) => Value
    ) {
        super(name, true);
    }

    protected runStep(stepState: State) {
        print(`  ${this.name}:`.padEnd(30, ' '));
        const endResult = benchmark(() => this.functionToBenchmark(stepState), {
            onAfterIteration: (benchmarkValue) =>
                print(this.formatValue(benchmarkValue).padEnd(10, ' ')),
            onNonDeterministicError: () =>
                print('    Not deterministic!', 'red'),
        });
        print('\n');
        // TODO: I couldn't get the typings to work here correctly
        return endResult as NonNullable<State[Name]>;
    }

    protected formatValue(value: BenchmarkValue<Value>) {
        return `${Math.round(value.time)}ms`;
    }
}
