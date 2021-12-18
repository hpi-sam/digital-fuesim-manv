import type { ExerciseState } from 'digital-fuesim-manv-shared';

/**
 * This actions sets the whole exercise state to a provided value
 */
export class SetExerciseAction {
    public readonly type = '[Exercise] Set state';

    constructor(public readonly exercise: ExerciseState) {}
}
