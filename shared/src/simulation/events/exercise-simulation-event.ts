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
import { LeaderChangedEvent } from './leader-changed';
import { MaterialRemovedEvent } from './material-removed';
import { PersonnelRemovedEvent } from './personnel-removed';
import { PatientRemovedEvent } from './patient-removed';
import { VehicleRemovedEvent } from './vehicle-removed';
import { TransferPatientsInSpecificVehicleRequestEvent } from './transfer-patients-in-specific-vehicle-request';
import { TransferSpecificVehicleRequestEvent } from './transfer-specific-vehicle-request';
import { TransferVehiclesRequestEvent } from './transfer-vehicles-request';
import { TransferPatientsRequestEvent } from './transfer-patients-request';
import { RequestReceivedEvent } from './request-received';
import { StartTransferEvent } from './start-transfer';
import { DoTransferEvent } from './do-transfer';
import { PatientTransferToHospitalSuccessfulEvent } from './patient-transfer-to-hospital-successful';
import { PatientCategoryTransferToHospitalFinishedEvent } from './patient-category-transfer-to-hospital-finished';

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
    LeaderChangedEvent,
    MaterialRemovedEvent,
    PersonnelRemovedEvent,
    PatientRemovedEvent,
    VehicleRemovedEvent,
    TransferPatientsInSpecificVehicleRequestEvent,
    TransferSpecificVehicleRequestEvent,
    TransferVehiclesRequestEvent,
    TransferPatientsRequestEvent,
    RequestReceivedEvent,
    StartTransferEvent,
    DoTransferEvent,
    PatientCategoryTransferToHospitalFinishedEvent,
    PatientTransferToHospitalSuccessfulEvent,
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
    leaderChangedEvent: LeaderChangedEvent,
    materialRemovedEvent: MaterialRemovedEvent,
    personnelRemovedEvent: PersonnelRemovedEvent,
    patientRemovedEvent: PatientRemovedEvent,
    vehicleRemovedEvent: VehicleRemovedEvent,
    transferPatientsInSpecificVehicleRequestEvent:
        TransferPatientsInSpecificVehicleRequestEvent,
    transferSpecificVehicleRequestEvent: TransferSpecificVehicleRequestEvent,
    transferVehiclesRequestEvent: TransferVehiclesRequestEvent,
    transferPatientsRequestEvent: TransferPatientsRequestEvent,
    requestReceivedEvent: RequestReceivedEvent,
    startTransferEvent: StartTransferEvent,
    doTransferEvent: DoTransferEvent,
    patientCategoryTransferToHospitalFinishedEvent:
        PatientCategoryTransferToHospitalFinishedEvent,
    patientTransferToHospitalSuccessfulEvent:
        PatientTransferToHospitalSuccessfulEvent,
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
