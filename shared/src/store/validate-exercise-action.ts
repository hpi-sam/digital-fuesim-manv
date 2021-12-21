import { plainToInstance } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import { validateSync } from 'class-validator';
import type { ExerciseAction } from '.';
import { ExerciseActions } from '.';

/**
 *
 * @param action An json object that should be checked for validity.
 * @returns An array of errors validating {@link action}. An empty array indicates a valid action object.
 */
export function validateExerciseAction(
    action: ExerciseAction
): (ValidationError | string)[] {
    // Be aware that `action` could be any json object. We need to program defensively here.
    if (typeof action.type !== 'string') {
        return ['Action type is not a string.'];
    }
    const actionClass = getExerciseActionClassDictionary()[action.type] as
        | ExerciseActionClassesDictionary[typeof action.type]
        | undefined;
    if (!actionClass) {
        return [`Unknown action type: ${action.type}`];
    }

    // This works - no idea about the type error though...
    return validateSync(plainToInstance(actionClass as any, action));
}

type ExerciseActionClassesDictionary = {
    [ActionClass in typeof ExerciseActions[keyof typeof ExerciseActions] as InstanceType<ActionClass>['type']]: ActionClass;
};

/**
 * This dictionary maps the action type to the class of the action.
 */
let exerciseActionClassesDictionary:
    | ExerciseActionClassesDictionary
    | undefined;

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
