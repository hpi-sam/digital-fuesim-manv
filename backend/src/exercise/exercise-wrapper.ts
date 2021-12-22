import type { ExerciseAction, ExerciseState } from 'digital-fuesim-manv-shared';
import { exerciseReducer, generateExercise } from 'digital-fuesim-manv-shared';

export class ExerciseWrapper {
    private currentState = generateExercise();

    private readonly stateHistory: ExerciseState[] = [];

    public getStateSnapshot(): ExerciseState {
        return this.currentState;
    }

    public reduce(action: ExerciseAction): void {
        this.setState(exerciseReducer(this.currentState, action));
    }

    private setState(newExerciseState: ExerciseState): void {
        this.stateHistory.push(this.currentState);
        this.currentState = newExerciseState;
    }
}
