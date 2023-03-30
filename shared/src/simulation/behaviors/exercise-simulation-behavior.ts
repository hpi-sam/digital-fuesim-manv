import type { Type } from 'class-transformer';
import { SimulationBehaviorState } from './simulation-behavior';
import { assignLeaderBehavior } from './assign-leader';
import { treatPatientsBehavior } from './treat-patients';
import { unloadArrivingVehiclesBehavior } from './unload-arrived-vehicles';
import { reportBehavior } from './report';

export const simulationBehaviors = {
    assignLeaderBehavior,
    treatPatientsBehavior,
    unloadArrivingVehiclesBehavior,
    reportBehavior,
};

export type ExerciseSimulationBehavior =
    (typeof simulationBehaviors)[keyof typeof simulationBehaviors];

export type ExerciseSimulationBehaviorType = InstanceType<
    ExerciseSimulationBehavior['behaviorState']
>['type'];

export type ExerciseSimulationBehaviorDictionary = {
    [Behavior in ExerciseSimulationBehavior as InstanceType<
        Behavior['behaviorState']
    >['type']]: Behavior;
};

export type ExerciseSimulationBehaviorState<
    T extends ExerciseSimulationBehaviorType = ExerciseSimulationBehaviorType
> = InstanceType<ExerciseSimulationBehaviorDictionary[T]['behaviorState']>;

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
