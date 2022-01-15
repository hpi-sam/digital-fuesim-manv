import { UserReadableIdGenerator } from '../../../utils/user-readable-id-generator';
import { exerciseMap } from '../../exercise-map';
import { ExerciseWrapper } from '../../exercise-wrapper';

interface ExerciseId {
    readonly exerciseId: string;
}

export const postExercise = (): ExerciseId => {
    const newExerciseId = UserReadableIdGenerator.generateId();
    exerciseMap.set(newExerciseId, new ExerciseWrapper());
    return {
        exerciseId: newExerciseId,
    };
};
