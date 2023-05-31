import type { Type } from 'class-transformer';
import { delayEventActivity } from './delay-event';
import { SimulationActivityState } from './simulation-activity';
import { reassignTreatmentsActivity } from './reassign-treatments';
import { unloadVehicleActivity } from './unload-vehicle';
import { recurringEventActivity } from './recurring-event';
import { generateReportActivity } from './generate-report';
import { providePersonnelFromVehiclesActivity } from './provide-personnel-from-vehicles';
import { createRequestActivity } from './create-request';
import { loadVehicleActivity } from './load-vehicle';
import { sendRemoteEventActivity } from './send-remote-event';
import { transferVehicleActivity } from './transfer-vehicle';
import { publishRadiogramActivity } from './publish-radiogram';
import { transferPatientToHospitalActivity } from './transfer-patient-to-hospital';
import { countPatientsActivity } from './count-patients';

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
    T extends ExerciseSimulationActivityType = ExerciseSimulationActivityType
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
