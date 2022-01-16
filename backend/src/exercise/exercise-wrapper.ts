import type { ExerciseAction, ExerciseState } from 'digital-fuesim-manv-shared';
import {
    reduceExerciseState,
    generateExercise,
} from 'digital-fuesim-manv-shared';

export class ExerciseWrapper {
    private currentState = generateExercise();

    private readonly stateHistory: ExerciseState[] = [];

    public getStateSnapshot(): ExerciseState {
        return this.currentState;
    }

    /**
     * Applies the action on the current state.
     * @throws Error if the action is not applicable on the current state
     */
    public reduce(action: ExerciseAction): void {
        const newState = reduceExerciseState(this.currentState, action);
        this.setState(newState);
    }

    private setState(newExerciseState: ExerciseState): void {
        this.stateHistory.push(this.currentState);
        this.currentState = newExerciseState;
    }
}
