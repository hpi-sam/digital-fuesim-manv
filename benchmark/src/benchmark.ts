import { defaults, isEqual } from 'lodash-es';

export interface BenchmarkValue<T> {
    /**
     * The value returned by the benchmarked function
     */
    value: T;
    /**
     * The average time it took to run the function in ms
     */
    time: number;
}

/**
 * @param functionToBenchmark the deterministic function that should be benchmarked, it will be run multiple times
 * @param options additional options for the benchmark, the defaults for the respective properties are {@link defaultOptions}
 */
export function benchmark<Value>(
    functionToBenchmark: () => Value,
    options: BenchmarkOptions<Value> = {}
): BenchmarkValue<Value> {
    // eslint-disable-next-line no-param-reassign
    options = defaults(options, defaultOptions);
    const benchmarkStepValues: BenchmarkValue<Value>[] = [];
    for (let i = 0; i < options.numberOfIterations!; i++) {
        const benchmarkStepValue = runBenchmarkOnce(functionToBenchmark);
        benchmarkStepValues.push(benchmarkStepValue);
        options.onAfterIteration?.(benchmarkStepValue);
    }
    if (
        benchmarkStepValues.length > 1 &&
        benchmarkStepValues.some(
            ({ value }) => !isEqual(benchmarkStepValues[0]!.value, value)
        )
    ) {
        options.onNonDeterministicError?.(benchmarkStepValues);
    }
    return {
        value: benchmarkStepValues[0]!.value,
        time:
            benchmarkStepValues.reduce(
                (timeSum, { time }) => timeSum + time,
                0
            ) / options.numberOfIterations!,
    };
}

function runBenchmarkOnce<Value>(
    functionToBenchmark: () => Value
): BenchmarkValue<Value> {
    const startTime = performance.now();
    const value = functionToBenchmark();
    const endTime = performance.now();
    return {
        value,
        time: endTime - startTime,
    };
}

interface BenchmarkOptions<Value> {
    /**
     * The number of times the function to benchmark should be run
     */
    numberOfIterations?: number;
    /**
     * Will be called after each iteration
     * @param benchmarkValue the BenchmarkValue of the function to benchmark in this iteration
     */
    onAfterIteration?: (benchmarkValue: BenchmarkValue<Value>) => void;
    /**
     * Will be called once if any of the iterations returned a different value than the first iteration (by value)
     * @param benchmarkValues the BenchmarkValues of the function to benchmark in all iterations
     */
    onNonDeterministicError?: (
        benchmarkValues: BenchmarkValue<Value>[]
    ) => void;
}

const defaultOptions: BenchmarkOptions<unknown> = {
    numberOfIterations: 3,
};
