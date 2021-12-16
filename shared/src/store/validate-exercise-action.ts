import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ExerciseAction, ExerciseActions } from '.';
import { ValidationFailedError } from '..';

/**
 *
 * @param action An json object that should be checked for validity.
 * @throws an error if the provided {@link action} is not an ExerciseAction.
 */
// TODO: would it be better to just return the error/a success boolean instead of throwing an error?
export function validateExerciseAction(action: ExerciseAction): void {
    // Be aware that `action` could be any json object. We need to program defensiv here.
    if (typeof action.type !== 'string') {
        // TODO: What kind of error should be thrown here?
        throw { errors: ['Action type is not a string.'] };
    }
    const actionClass = getExerciseActionClassDictionary()[action.type] as
        | ExerciseActionClassesDictionary[typeof action.type]
        | undefined;
    if (!actionClass) {
        // TODO: What kind of error should be thrown here?
        throw {
            errors: [`Unknown action type: ${action.type}`],
        };
    }

    // This works - no idea about the type error though...
    const errors = validateSync(plainToInstance(actionClass as any, action));
    if (errors.length > 0) {
        throw new ValidationFailedError(errors);
    }
}

type ExerciseActionClassesDictionary = {
    [ActionClass in typeof ExerciseActions[keyof typeof ExerciseActions] as InstanceType<ActionClass>['type']]: ActionClass;
};

/**
 * This dictionary maps the action type to the class of the action.
 */
let exerciseActionClassesDictionary:
    | ExerciseActionClassesDictionary
    | undefined = undefined;

// TODO: write a test for this function
/**
 * Lazy initializes the exerciseActionClassesDictionary and returns it.
 */
function getExerciseActionClassDictionary(): ExerciseActionClassesDictionary {
    if (exerciseActionClassesDictionary) {
        return exerciseActionClassesDictionary;
    }
    const dictionary = {} as any;
    // fill in the dictionary
    Object.values(ExerciseActions)
        .map(
            (actionClass) =>
                ({
                    // the generated ts code from class default values adds them only in the constructor: https://github.com/microsoft/TypeScript/issues/15607
                    // therefore we have to call the constructor (An ActionClass constructor is therefore required to not throw an error when called without arguments)
                    type: new actionClass().type,
                    actionClass,
                } as const)
        )
        .forEach(({ type, actionClass }) => {
            // because ts doesn't know that the pairs of type and actionClass are matching
            dictionary[type] = actionClass as any;
        });
    exerciseActionClassesDictionary = dictionary;
    return exerciseActionClassesDictionary!;
}
