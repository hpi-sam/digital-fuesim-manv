import { unloadVehicleActivity } from './unload-vehicle';

export const simulationActivities = {
    unloadVehicleActivity,
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
