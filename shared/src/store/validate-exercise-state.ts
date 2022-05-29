import { plainToInstance } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import { validateSync } from 'class-validator';
import { ExerciseState } from '../state';
import { defaultValidateOptions } from './validation-options';

/**
 *
 * @param state An json object that should be checked for validity.
 * @returns An array of errors validating {@link action}. An empty array indicates a valid action object.
 */
export function validateExerciseState(
    state: ExerciseState
): (ValidationError | string)[] {
    return validateSync(
        plainToInstance(ExerciseState, state),
        defaultValidateOptions
    );
}
