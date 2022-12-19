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
    validateExerciseExport,
} from 'digital-fuesim-manv-shared';
import produce, { freeze } from 'immer';
import { isEqual } from 'lodash-es';
import type { BenchmarkStepValue } from './benchmark-step';
import { BenchmarkStep } from './benchmark-step';
import type { Step } from './step';
import { CalculationStep } from './calculation-step';

export class StepState {
    public readonly migrate?: BenchmarkStepValue<StateExport>;
    public readonly validateExercise?: BenchmarkStepValue<any[]>;
    public readonly freezeState?: {
        initialState: ExerciseState;
        actionHistory: readonly ExerciseAction[];
    };
    public readonly newImmerDraft?: BenchmarkStepValue<ExerciseState>;
    public readonly sameImmerDraft?: BenchmarkStepValue<ExerciseState>;
    public readonly noImmerDraft?: BenchmarkStepValue<ExerciseState>;
    public readonly isConsistent?: boolean;
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
        'isConsistent',
        ({ newImmerDraft, sameImmerDraft, noImmerDraft }) =>
            isEqual(newImmerDraft!.value, sameImmerDraft!.value) &&
            isEqual(newImmerDraft!.value, noImmerDraft!.value)
    ),
    new CalculationStep(
        '#actions',
        ({ freezeState }) => freezeState!.actionHistory.length
    ),
];
