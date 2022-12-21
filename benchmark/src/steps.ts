import type {
    ExerciseAction,
    ExerciseState,
    StateExport,
    StateHistoryCompound,
} from 'digital-fuesim-manv-shared';
import {
    applyAction,
    cloneDeepMutable,
    migrateStateExport,
    reduceExerciseState,
    StrictObject,
    validateExerciseExport,
} from 'digital-fuesim-manv-shared';
import produce, { freeze } from 'immer';
import { isEqual } from 'lodash-es';
import type { BenchmarkValue } from './benchmark';
import { benchmark } from './benchmark';
import { BenchmarkStep } from './benchmark-step';
import { CalculationStep } from './calculation-step';
import { print } from './print';
import type { Step } from './step';

export class StepState {
    public readonly migrate?: BenchmarkValue<StateExport>;
    public readonly validateExercise?: BenchmarkValue<any[]>;
    public readonly freezeState?: {
        initialState: ExerciseState;
        actionHistory: readonly ExerciseAction[];
    };
    public readonly newImmerDraft?: BenchmarkValue<ExerciseState>;
    public readonly sameImmerDraft?: BenchmarkValue<ExerciseState>;
    public readonly noImmerDraft?: BenchmarkValue<ExerciseState>;
    public readonly endStatesAreEqual?: boolean;
    /**
     * The total benchmarked time it took to execute one action of each type in ms
     * (sum of all benchmarked times)
     * Sorted by time (descending)
     */
    public readonly benchmarkActions?: {
        [key in ExerciseAction['type']]?: number;
    };
    /**
     * The most expensive action in the exercise (summed up time)
     */
    public readonly mostExpensiveAction?: string;
    /**
     * The number of actions of each type
     * Sorted by amount (descending)
     */
    public readonly numberOfActionsPerType?: {
        [key in ExerciseAction['type']]?: number;
    };
    public readonly '#actions'?: number;

    constructor(public readonly data: StateExport) {}
}

export const steps: Step<StepState>[] = [
    new BenchmarkStep(
        'migrate',
        ({ data }) => migrateStateExport(data) as StateExport
    ),
    new BenchmarkStep('validateExercise', ({ migrate: migratedValues }) =>
        validateExerciseExport(migratedValues!.value)
    ),
    new CalculationStep(
        'freezeState',
        ({ migrate: migratedValues }) => {
            if (!migratedValues?.value.history) {
                throw new Error('State export is missing history');
            }
            const history = migratedValues.value.history;
            freeze(history, true);
            return history as StateHistoryCompound;
        },
        false
    ),
    new BenchmarkStep('newImmerDraft', ({ freezeState }) => {
        const { actionHistory, initialState } = freezeState!;

        // Apply each action on a new immer draft
        return actionHistory.reduce(
            (state, action) => reduceExerciseState(state, action),
            initialState
        );
    }),
    new BenchmarkStep('sameImmerDraft', ({ freezeState }) => {
        const { actionHistory, initialState } = freezeState!;

        // Apply all action on the same immer draft
        return produce(initialState, (draftState) => {
            for (const action of actionHistory) {
                applyAction(draftState, action);
            }
        });
    }),
    new BenchmarkStep('noImmerDraft', ({ freezeState }) => {
        const { actionHistory, initialState } = freezeState!;

        // Apply all action on the same immer draft
        return actionHistory.reduce(
            (state, action) => applyAction(state, action),
            cloneDeepMutable(initialState)
        );
    }),
    new CalculationStep(
        'endStatesAreEqual',
        ({ newImmerDraft, sameImmerDraft, noImmerDraft }) => {
            const endStatesAreEqual =
                isEqual(newImmerDraft!.value, sameImmerDraft!.value) &&
                isEqual(newImmerDraft!.value, noImmerDraft!.value);
            if (!endStatesAreEqual) {
                print(
                    `  The endStates of the previous three steps are not equal!\n`,
                    'red'
                );
            }
            return endStatesAreEqual;
        },
        false
    ),
    new CalculationStep(
        'benchmarkActions',
        ({ freezeState, newImmerDraft }) => {
            print(`  benchmarkActions: `);
            const { actionHistory, initialState } = freezeState!;
            const totalTimePerAction: {
                [key in ExerciseAction['type']]?: number;
            } = {};
            let currentState = initialState;
            for (const action of actionHistory) {
                // eslint-disable-next-line @typescript-eslint/no-loop-func
                const { value: newState, time } = benchmark(() =>
                    reduceExerciseState(currentState, action)
                );

                currentState = newState;
                totalTimePerAction[action.type] =
                    (totalTimePerAction[action.type] ?? 0) + time;
            }
            const sortedTotalTimePerAction = sortObject(
                totalTimePerAction,
                ([, timeA], [, timeB]) => timeB! - timeA!
            );
            print(
                // In the object are only entries we explicitly set -> no need to check for undefined
                (
                    StrictObject.entries(sortedTotalTimePerAction) as [
                        ExerciseAction['type'],
                        number
                    ][]
                )
                    .map(([type, time]) => `${type}: ${time.toFixed(2)}ms,`)
                    .join(' ')
            );
            print(`\n`);
            const summedUpExerciseTime =
                StrictObject.values(totalTimePerAction).reduce(
                    // In the object are only entries we explicitly set
                    (totalTime, timePerAction) => totalTime! + timePerAction!,
                    0
                ) ?? 0;
            const summedUpVsDirectTime =
                summedUpExerciseTime / newImmerDraft!.time;
            if (summedUpVsDirectTime > 1.1 || summedUpVsDirectTime < 0.9) {
                print(
                    `    The summed up time of all actions is ${summedUpVsDirectTime.toFixed(
                        2
                    )} times the time of the direct benchmark ("newImmerDraft").\n`,
                    'yellow'
                );
            }
            return sortedTotalTimePerAction;
        },
        false
    ),
    new CalculationStep('mostExpensiveAction', ({ benchmarkActions }) => {
        const mostExpensiveAction = StrictObject.entries(benchmarkActions!)[0];
        if (!mostExpensiveAction) {
            return `No actions`;
        }
        return `${mostExpensiveAction[0]} (${mostExpensiveAction[1]!.toFixed(
            2
        )}ms)`;
    }),
    new CalculationStep(
        'numberOfActionsPerType',
        ({ freezeState }) => {
            print(`  numberOfActionsPerType: `);
            const { actionHistory } = freezeState!;
            const numberOfActionsPerType: {
                [key in ExerciseAction['type']]?: number;
            } = {};
            for (const action of actionHistory) {
                numberOfActionsPerType[action.type] =
                    (numberOfActionsPerType[action.type] ?? 0) + 1;
            }
            const sortedNumberOfActionsPerType = sortObject(
                numberOfActionsPerType,
                ([, amountA], [, amountB]) => amountB! - amountA!
            );
            print(
                // In the object are only entries we explicitly set -> no need to check for undefined
                (
                    StrictObject.entries(sortedNumberOfActionsPerType) as [
                        ExerciseAction['type'],
                        number
                    ][]
                )
                    .map(([type, amount]) => `${type}: ${amount},`)
                    .join(' ')
            );
            return sortedNumberOfActionsPerType;
        },
        false
    ),
    new CalculationStep(
        '#actions',
        ({ freezeState }) => freezeState!.actionHistory.length
    ),
];

function sortObject<T extends { [key: string]: any }>(
    obj: T,
    compareFn: (a: [keyof T, T[keyof T]], b: [keyof T, T[keyof T]]) => number
): T {
    return Object.fromEntries(StrictObject.entries(obj).sort(compareFn)) as T;
}
