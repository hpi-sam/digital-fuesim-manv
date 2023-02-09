import { unloadArrivingVehiclesBehavior } from './unload-arrived-vehicles';

export const simulationBehaviors = {
    unloadArrivingVehiclesBehavior,
};

export type ExerciseSimulationBehavior =
    (typeof simulationBehaviors)[keyof typeof simulationBehaviors];

export type ExerciseSimulationBehaviorState = InstanceType<
    ExerciseSimulationBehavior['behaviorState']
>;

// TODO: typing
export const simulationBehaviorDirectory = Object.fromEntries(
    Object.values(simulationBehaviors).map((behavior) => [
        new behavior.behaviorState().type,
        behavior,
    ])
);
