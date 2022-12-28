import { plainToInstance } from 'class-transformer';
import type {
    ValidationArguments,
    ValidationError,
    ValidationOptions,
} from 'class-validator';
import { validateSync } from 'class-validator';
import type { Constructor } from '../utils';
import type { GenericPropertyDecorator } from '../utils/validators/generic-property-decorator';
import { makeValidator } from '../utils/validators/make-validator';
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

// Decorators for validation
// Placed here instead of in utils/validators to prevent circular imports

export function isExerciseAction(value: unknown): value is ExerciseAction {
    return validateExerciseAction(value as ExerciseAction).length === 0;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsExerciseAction<Each extends boolean>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<ExerciseAction, Each> {
    return makeValidator<ExerciseAction, Each>(
        'isExerciseAction',
        (value: unknown, args?: ValidationArguments) => isExerciseAction(value),
        validationOptions
    );
}
