import type { Type } from 'class-transformer';
import type { Constructor } from '../../utils';
import { SimulationEvent } from './simulation-event';
import { MaterialAvailableEvent } from './material-available';
import { NewPatientEvent } from './new-patient';
import { PersonnelAvailableEvent } from './personnel-available';
import { TickEvent } from './tick';
import { VehicleArrivedEvent } from './vehicle-arrived';
import { TreatmentsTimerEvent } from './treatments-timer-event';
import { TreatmentProgressChangedEvent } from './treatment-progress-changed';
import { CollectInformationEvent } from './collect';
import { StartCollectingInformationEvent } from './start-collecting';
import { ResourceRequiredEvent } from './resources-required';
import { VehiclesSentEvent } from './vehicles-sent';
import { TryToDistributeEvent } from './try-to-distribute';
import { VehicleTransferSuccessfulEvent } from './vehicle-transfer-successful';
import { TransferConnectionMissingEvent } from './transfer-connection-missing';
import { SendRequestEvent } from './send-request';
import { MaterialRemovedEvent } from './material-removed';
import { PersonnelRemovedEvent } from './personnel-removed';
import { PatientRemovedEvent } from './patient-removed';
import { VehicleRemovedEvent } from './vehicle-removed';

export const simulationEvents = {
    MaterialAvailableEvent,
    NewPatientEvent,
    PersonnelAvailableEvent,
    TickEvent,
    TreatmentProgressChangedEvent,
    TreatmentsTimerEvent,
    VehicleArrivedEvent,
    CollectInformationEvent,
    StartCollectingInformationEvent,
    ResourceRequiredEvent,
    VehiclesSentEvent,
    TryToDistributeEvent,
    VehicleTransferSuccessfulEvent,
    TransferConnectionMissingEvent,
    SendRequestEvent,
    MaterialRemovedEvent,
    PersonnelRemovedEvent,
    PatientRemovedEvent,
    VehicleRemovedEvent,
};

export type ExerciseSimulationEvent = InstanceType<
    (typeof simulationEvents)[keyof typeof simulationEvents]
>;

type ExerciseSimulationEventDictionary = {
    [EventType in ExerciseSimulationEvent as EventType['type']]: Constructor<EventType>;
};

// TODO: compute dynamically
export const simulationEventDictionary: ExerciseSimulationEventDictionary = {
    materialAvailableEvent: MaterialAvailableEvent,
    newPatientEvent: NewPatientEvent,
    personnelAvailableEvent: PersonnelAvailableEvent,
    tickEvent: TickEvent,
    treatmentProgressChangedEvent: TreatmentProgressChangedEvent,
    treatmentsTimerEvent: TreatmentsTimerEvent,
    vehicleArrivedEvent: VehicleArrivedEvent,
    collectInformationEvent: CollectInformationEvent,
    startCollectingInformationEvent: StartCollectingInformationEvent,
    resourceRequiredEvent: ResourceRequiredEvent,
    vehiclesSentEvent: VehiclesSentEvent,
    tryToDistributeEvent: TryToDistributeEvent,
    vehicleTransferSuccessfulEvent: VehicleTransferSuccessfulEvent,
    transferConnectionMissingEvent: TransferConnectionMissingEvent,
    sendRequestEvent: SendRequestEvent,
    materialRemovedEvent: MaterialRemovedEvent,
    personnelRemovedEvent: PersonnelRemovedEvent,
    patientRemovedEvent: PatientRemovedEvent,
    vehicleRemovedEvent: VehicleRemovedEvent,
};

export const simulationEventTypeOptions: Parameters<typeof Type> = [
    () => SimulationEvent,
    {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: Object.entries(simulationEventDictionary).map(
                ([name, value]) => ({ name, value })
            ),
        },
    },
];
