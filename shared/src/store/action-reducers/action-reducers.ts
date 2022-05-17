import { ClientActionReducers } from './client';
import { ExerciseActionReducers } from './exercise';
import { ExerciseSettingsActionReducers } from './exercise-settings';
import { MapImageTemplatesActionReducers } from './map-image-templates';
import { MapImagesActionReducers } from './map-images';
import { MaterialActionReducers } from './material';
import { PatientActionReducers } from './patient';
import { PersonnelActionReducers } from './personnel';
import { TransferActionReducers } from './transfer';
import { TransferPointActionReducers } from './transfer-point';
import { VehicleActionReducers } from './vehicle';
import { ViewportActionReducers } from './viewport';

/**
 * All action reducers of the exercise must be registered here
 */
const actionReducers = {
    ...ClientActionReducers,
    ...ExerciseActionReducers,
    ...MaterialActionReducers,
    ...MapImagesActionReducers,
    ...PatientActionReducers,
    ...PersonnelActionReducers,
    ...VehicleActionReducers,
    ...ViewportActionReducers,
    ...TransferPointActionReducers,
    ...ExerciseSettingsActionReducers,
    ...MapImageTemplatesActionReducers,
    ...TransferActionReducers,
};

type ExerciseActionReducer = typeof actionReducers[keyof typeof actionReducers];

type ExerciseActionTypeDictionary = {
    [_ActionReducer in ExerciseActionReducer as InstanceType<
        _ActionReducer['action']
    >['type']]: _ActionReducer;
};

/**
 * This dictionary maps the action type to the ActionReducer.
 */
let exerciseActionTypeDictionary: ExerciseActionTypeDictionary | undefined;

export function getExerciseActionTypeDictionary(): ExerciseActionTypeDictionary {
    if (exerciseActionTypeDictionary) {
        return exerciseActionTypeDictionary;
    }
    const dictionary = {} as any;
    // fill in the dictionary
    Object.values(actionReducers)
        .map(
            (actionReducer) =>
                ({
                    // the generated ts code from class default values adds them only in the constructor: https://github.com/microsoft/TypeScript/issues/15607
                    // therefore we have to call the constructor (An ActionClass constructor is therefore required to not throw an error when called without arguments)
                    type: new actionReducer.action().type,
                    actionClass: actionReducer,
                } as const)
        )
        .forEach(({ type, actionClass }) => {
            dictionary[type] = actionClass;
        });
    exerciseActionTypeDictionary = dictionary as ExerciseActionTypeDictionary;
    return exerciseActionTypeDictionary;
}

/**
 * A Union of all actions of the exercise.
 */
export type ExerciseAction = InstanceType<ExerciseActionReducer['action']>;
