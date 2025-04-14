import type { Type } from 'class-transformer';
import { delayEventActivity } from './delay-event.js';
import { SimulationActivityState } from './simulation-activity.js';
import { reassignTreatmentsActivity } from './reassign-treatments.js';
import { unloadVehicleActivity } from './unload-vehicle.js';
import { recurringEventActivity } from './recurring-event.js';
import { generateReportActivity } from './generate-report.js';
import { providePersonnelFromVehiclesActivity } from './provide-personnel-from-vehicles.js';
import { createRequestActivity } from './create-request.js';
import { loadVehicleActivity } from './load-vehicle.js';
import { sendRemoteEventActivity } from './send-remote-event.js';
import { transferVehicleActivity } from './transfer-vehicle.js';
import { publishRadiogramActivity } from './publish-radiogram.js';
import { transferPatientToHospitalActivity } from './transfer-patient-to-hospital.js';
import { countPatientsActivity } from './count-patients.js';

export const simulationActivities = {
    reassignTreatmentsActivity,
    unloadVehicleActivity,
    delayEventActivity,
    recurringEventActivity,
    generateReportActivity,
    providePersonnelFromVehiclesActivity,
    createRequestActivity,
    loadVehicleActivity,
    sendRemoteEventActivity,
    transferVehicleActivity,
    publishRadiogramActivity,
    transferPatientToHospitalActivity,
    countPatientsActivity,
};

export type ExerciseSimulationActivity =
    (typeof simulationActivities)[keyof typeof simulationActivities];

type ExerciseSimulationActivityDictionary = {
    [Activity in ExerciseSimulationActivity as InstanceType<
        Activity['activityState']
    >['type']]: Activity;
};

export type ExerciseSimulationActivityType = InstanceType<
    ExerciseSimulationActivity['activityState']
>['type'];

export type ExerciseSimulationActivityState<
    T extends ExerciseSimulationActivityType = ExerciseSimulationActivityType,
> = InstanceType<ExerciseSimulationActivityDictionary[T]['activityState']>;

export const simulationActivityDictionary = Object.fromEntries(
    Object.values(simulationActivities).map((activity) => [
        new activity.activityState().type,
        activity,
    ])
) as ExerciseSimulationActivityDictionary;

export function getSimulationActivityConstructor(
    state: ExerciseSimulationActivityState
) {
    return simulationActivityDictionary[state.type].activityState;
}

export const simulationActivityTypeOptions: Parameters<typeof Type> = [
    () => SimulationActivityState,
    {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: Object.entries(simulationActivityDictionary).map(
                ([name, value]) => ({ name, value: value.activityState })
            ),
        },
    },
];
