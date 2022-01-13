import { exerciseMap } from '../../exercise-map';
import { ExerciseWrapper } from '../../exercise-wrapper';

const createExerciseId = (): number => Math.floor(Math.random() * 100_000);

interface ExerciseId {
    readonly exerciseId: string;
}

export const postExercise = (): ExerciseId => {
    let newExerciseId: string | undefined;
    do {
        newExerciseId = createExerciseId().toString();
        if (exerciseMap.has(newExerciseId)) {
            newExerciseId = undefined;
        }
    } while (newExerciseId === undefined);
    exerciseMap.set(newExerciseId, new ExerciseWrapper());
    return {
        exerciseId: newExerciseId,
    };
};
