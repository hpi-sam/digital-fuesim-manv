import type { Type } from 'class-transformer';
import { SimulationBehaviorState } from './simulation-behavior';
import { unloadArrivingVehiclesBehavior } from './unload-arrived-vehicles';

export const simulationBehaviors = {
    unloadArrivingVehiclesBehavior,
};

export type ExerciseSimulationBehavior =
    (typeof simulationBehaviors)[keyof typeof simulationBehaviors];

export type ExerciseSimulationBehaviorState = InstanceType<
    ExerciseSimulationBehavior['behaviorState']
>;

type ExerciseSimulationBehaviorDictionary = {
    [Behavior in ExerciseSimulationBehavior as InstanceType<
        Behavior['behaviorState']
    >['type']]: Behavior;
};

export const simulationBehaviorDictionary = Object.fromEntries(
    Object.values(simulationBehaviors).map((behavior) => [
        new behavior.behaviorState().type,
        behavior,
    ])
) as ExerciseSimulationBehaviorDictionary;

export const simulationBehaviorTypeOptions: Parameters<typeof Type> = [
    () => SimulationBehaviorState,
    {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: Object.entries(simulationBehaviorDictionary).map(
                ([name, value]) => ({ name, value: value.behaviorState })
            ),
        },
    },
];
