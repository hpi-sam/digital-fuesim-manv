import { unloadVehicleActivity } from './unload-vehicle';

export const simulationActivities = {
    unloadVehicleActivity,
};

export type ExerciseSimulationActivity = typeof unloadVehicleActivity;

export type ExerciseSimulationActivityState = InstanceType<
    ExerciseSimulationActivity['activityState']
>;

// TODO: typing
export const simulationActivityDirectory = Object.fromEntries(
    Object.values(simulationActivities).map((activity) => [
        new activity.activityState().type,
        activity,
    ])
);
