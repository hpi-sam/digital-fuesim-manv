import { AlarmGroupActionReducers } from './alarm-group.js';
import { ClientActionReducers } from './client.js';
import { ExerciseActionReducers } from './exercise.js';
import { ConfigurationActionReducers } from './configuration.js';
import { HospitalActionReducers } from './hospital.js';
import { MapImageTemplatesActionReducers } from './map-image-templates.js';
import { MapImagesActionReducers } from './map-images.js';
import { MaterialActionReducers } from './material.js';
import { PatientActionReducers } from './patient.js';
import { PersonnelActionReducers } from './personnel.js';
import { TransferActionReducers } from './transfer.js';
import { TransferPointActionReducers } from './transfer-point.js';
import { VehicleActionReducers } from './vehicle.js';
import { ViewportActionReducers } from './viewport.js';
import { EmergencyOperationCenterActionReducers } from './emergency-operation-center.js';
import { SimulatedRegionActionReducers } from './simulated-region.js';
import { SimulationActionReducers } from './simulation.js';
import { RadiogramActionReducers } from './radiogram.js';
import { VehicleTemplateActionReducers } from './vehicle-templates.js';

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
    ...ConfigurationActionReducers,
    ...AlarmGroupActionReducers,
    ...MapImageTemplatesActionReducers,
    ...TransferActionReducers,
    ...HospitalActionReducers,
    ...EmergencyOperationCenterActionReducers,
    ...SimulatedRegionActionReducers,
    ...SimulationActionReducers,
    ...RadiogramActionReducers,
    ...VehicleTemplateActionReducers,
};

type ExerciseActionReducer =
    (typeof actionReducers)[keyof typeof actionReducers];

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
    // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
    Object.values(actionReducers)
        .map(
            (actionReducer) =>
                ({
                    // the generated ts code from class default values adds them only in the constructor: https://github.com/microsoft/TypeScript/issues/15607
                    // therefore we have to call the constructor (An ActionClass constructor is therefore required to not throw an error when called without arguments)
                    type: new actionReducer.action().type,
                    actionClass: actionReducer,
                }) as const
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
