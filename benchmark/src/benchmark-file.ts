import { promises as fs } from 'node:fs';
import type {
    ExerciseAction,
    ExerciseState,
    Mutable,
    StateExport,
} from 'digital-fuesim-manv-shared';
import {
    applyAction,
    applyAllActions,
    cloneDeepMutable,
    migrateStateExport,
    reduceExerciseState,
    validateExerciseExport,
} from 'digital-fuesim-manv-shared';
import { freeze } from 'immer';
import { isEqual } from 'lodash-es';
import { printError } from './print-error';

export interface BenchmarkResult {
    fileName: string;
    /**
     * Size of the file in bytes
     */
    fileSize: number;
    numberOfActions: number;
    benchmarks: {
        name: string;
        time: number;
    }[];
    /**
     * True if the results of the benchmarks are all the same (deep equality)
     */
    benchmarkResultsWereConsistent: boolean;
}

export async function benchmarkFile(
    path: string
): Promise<BenchmarkResult | undefined> {
    let data;
    try {
        // eslint-disable-next-line no-await-in-loop
        data = await fs.readFile(path, 'utf8');
    } catch {
        printError(`Could not read file ${path}`);
        return;
    }
    const fileSize = (await fs.stat(path)).size;
    console.log('Start benchmarks for', path);
    let stateExport: Mutable<StateExport>;
    let migrationTime: number;
    try {
        const parsedData = JSON.parse(data);
        const { result, time } = runBenchmark('migrate', () =>
            migrateStateExport(parsedData)
        );
        stateExport = result;
        migrationTime = time;
    } catch (error: any) {
        printError('Error while parsing and migrating state export', error);
        return;
    }

    const { result: validationErrors, time: validationTime } = runBenchmark(
        'validate',
        () => validateExerciseExport(stateExport as any)
    );
    if (validationErrors.length !== 0) {
        printError('Validation errors', validationErrors);
        return;
    }
    if (!stateExport.history) {
        printError(`Skipping ${path} because it has no actions`);
        return;
    }

    const initialState = stateExport.history.initialState;
    const actions = stateExport.history.actionHistory;
    freeze(initialState, true);
    freeze(actions, true);

    const benchmarkResults: {
        name: string;
        time: number;
        endResult: ExerciseState;
    }[] = [];

    for (const benchmark of benchmarks) {
        const { result, time } = runBenchmark(benchmark.name, () =>
            benchmark.benchmark(initialState, actions)
        );
        benchmarkResults.push({
            name: benchmark.name,
            time,
            endResult: result,
        });
    }
    const benchmarkResultsWereConsistent = benchmarkResults.every(
        ({ endResult }) => isEqual(endResult, benchmarkResults[0]!.endResult)
    );

    return {
        fileName: path,
        benchmarkResultsWereConsistent,
        numberOfActions: stateExport.history.actionHistory.length,
        fileSize,
        benchmarks: [
            {
                name: 'migration',
                time: migrationTime,
            },
            {
                name: 'validation',
                time: validationTime,
            },
            ...benchmarkResults,
        ],
    };
}

function runBenchmark<T>(
    name: string,
    benchmark: () => T
): {
    readonly result: T;
    readonly time: number;
} {
    console.log('Start benchmark', name);
    const numberOfIterations = 3;
    const runBenchmarkOnce = () => {
        const startTime = performance.now();
        const result = benchmark();
        const endTime = performance.now();
        return {
            result,
            time: endTime - startTime,
        };
    };
    let timeSum = 0;
    let previousBenchmarkResult: T | undefined;
    for (let i = 0; i < numberOfIterations; i++) {
        console.log(`iteration ${i + 1} of ${numberOfIterations}`);
        const { time, result } = runBenchmarkOnce();
        if (i !== 0 && !isEqual(previousBenchmarkResult, result)) {
            printError('Benchmark is not deterministic!');
        }
        previousBenchmarkResult = result;
        timeSum += time;
    }
    return {
        result: previousBenchmarkResult!,
        time: timeSum / numberOfIterations,
    };
}

const benchmarks: readonly Benchmark[] = [
    {
        // Apply each action on a new immer draft
        name: 'newImmerDraft',
        benchmark(initialState, actions) {
            return actions.reduce(
                (state, action) => reduceExerciseState(state, action),
                initialState
            );
        },
    },
    {
        // Apply all action on the same immer draft
        name: 'sameImmerDraft',
        benchmark(initialState, actions) {
            return applyAllActions(initialState, actions);
        },
    },
    {
        // Apply all action on the same immer draft
        name: 'noImmerDraft',
        benchmark(initialState, actions) {
            return actions.reduce(
                (state, action) => applyAction(state, action),
                cloneDeepMutable(initialState)
            );
        },
    },
];

interface Benchmark {
    readonly name: string;
    readonly benchmark: (
        initialState: ExerciseState,
        actions: ExerciseAction[]
    ) => ExerciseState;
}
