import type { Type } from 'class-transformer';
import { SimulationBehaviorState } from './simulation-behavior.js';
import { assignLeaderBehavior } from './assign-leader.js';
import { treatPatientsBehavior } from './treat-patients.js';
import { unloadArrivingVehiclesBehavior } from './unload-arrived-vehicles.js';
import { reportBehavior } from './report.js';
import { automaticallyDistributeVehiclesBehavior } from './automatically-distribute-vehicles.js';
import { providePersonnelBehavior } from './provide-personnel.js';
import { answerRequestsBehavior } from './answer-requests.js';
import { requestBehavior } from './request.js';
import { transferBehavior } from './transfer.js';
import { transferToHospitalBehavior } from './transfer-to-hospital.js';
import { managePatientTransportToHospitalBehavior } from './manage-patient-transport-to-hospital.js';

export const simulationBehaviors = {
    automaticallyDistributeVehiclesBehavior,
    assignLeaderBehavior,
    treatPatientsBehavior,
    unloadArrivingVehiclesBehavior,
    reportBehavior,
    providePersonnelBehavior,
    answerRequestsBehavior,
    requestBehavior,
    transferBehavior,
    transferToHospitalBehavior,
    managePatientTransportToHospitalBehavior,
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
    T extends ExerciseSimulationBehaviorType = ExerciseSimulationBehaviorType,
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
