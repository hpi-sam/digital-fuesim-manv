import { isEqual } from 'lodash-es';

export interface BenchmarkValue<T> {
    value: T;
    time: number;
}

/**
 * @param functionToBenchmark the deterministic function that should be benchmarked, it will be run multiple times
 * @returns
 */
export function benchmark<Value>(
    functionToBenchmark: () => Value,
    options: BenchmarkOptions<Value> = {}
): BenchmarkValue<Value> {
    // eslint-disable-next-line no-param-reassign
    options = { ...defaultOptions, ...options };
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
    const endResult: BenchmarkValue<Value> = {
        value: benchmarkStepValues[0]!.value,
        time:
            benchmarkStepValues.reduce(
                (timeSum, { time }) => timeSum + time,
                0
            ) / options.numberOfIterations!,
    };
    return endResult;
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
     * @param benchmarkValue the value of the function to benchmark in this iteration
     */
    onAfterIteration?: (benchmarkValue: BenchmarkValue<Value>) => void;
    /**
     * Will be called once if any of the iterations returned a different value than the first iteration (by value)
     * @param benchmarkValues the values of the function to benchmark in all iterations
     */
    onNonDeterministicError?: (
        benchmarkValues: BenchmarkValue<Value>[]
    ) => void;
}

const defaultOptions: BenchmarkOptions<unknown> = {
    numberOfIterations: 3,
};
