import {
    ExerciseAction,
    exerciseReducer,
    ExerciseState,
    generateExercise,
} from 'digital-fuesim-manv-shared';

export class ExerciseWrapper {
    private currentState = generateExercise();

    private stateHistory: ExerciseState[] = [];

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
