import { plainToInstance } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import { validateSync } from 'class-validator';
import type { Constructor } from '../utils';
import type { ExerciseAction } from './action-reducers';
import { getExerciseActionTypeDictionary } from './action-reducers';
import { defaultValidateOptions } from './validation-options';

/**
 *
 * @param action A json object that should be checked for validity.
 * @returns An array of errors validating {@link action}. An empty array indicates a valid action object.
 */
export function validateExerciseAction(
    action: ExerciseAction
): (ValidationError | string)[] {
    // Be aware that `action` could be any json object. We need to program defensively here.
    if (typeof action.type !== 'string') {
        return ['Action type is not a string.'];
    }
    const actionClass = getExerciseActionTypeDictionary()[action.type]?.action;
    // if the action.type is not a valid action type, the actionClass is undefined.
    if (!actionClass) {
        return [`Unknown action type: ${action.type}`];
    }

    // This works - no idea about the type error though...
    return validateSync(
        plainToInstance(actionClass as Constructor<ExerciseAction>, action),
        defaultValidateOptions
    );
}
