import { ExerciseState } from './state';
import { validateExerciseState } from './store';

describe('ExerciseState', () => {
    // If this fails, either the created state is invalid, or a validator is incorrect/missing in a model.
    it('creates a valid state', () => {
        const exercise = ExerciseState.create('123456');
        const validation = validateExerciseState(exercise);
        expect(validation.length).toBe(0);
    });
});
