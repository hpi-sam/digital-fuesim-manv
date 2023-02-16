import type { Type } from 'class-transformer';
import { delayEventActivity } from './delay-event';
import { SimulationActivityState } from './simulation-activity';
import { unloadVehicleActivity } from './unload-vehicle';

export const simulationActivities = {
    unloadVehicleActivity,
    delayEventActivity,
};

export type ExerciseSimulationActivity =
    (typeof simulationActivities)[keyof typeof simulationActivities];

export type ExerciseSimulationActivityState = InstanceType<
    ExerciseSimulationActivity['activityState']
>;

type ExerciseSimulationActivityDictionary = {
    [Activity in ExerciseSimulationActivity as InstanceType<
        Activity['activityState']
    >['type']]: Activity;
};

export const simulationActivityDictionary = Object.fromEntries(
    Object.values(simulationActivities).map((activity) => [
        new activity.activityState().type,
        activity,
    ])
) as ExerciseSimulationActivityDictionary;

export function getSimulationActivityConstructor(
    state: ExerciseSimulationActivityState
) {
    return simulationActivityDictionary[state.type]?.activityState;
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
