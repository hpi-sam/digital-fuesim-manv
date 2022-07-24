import { ExerciseState } from './state';
import { validateExerciseState } from './store';

describe('ExerciseState', () => {
    it('validates a fresh state', () => {
        const exercise = ExerciseState.create();
        const validation = validateExerciseState(exercise);
        expect(validation.length).toBe(0);
    });
});
