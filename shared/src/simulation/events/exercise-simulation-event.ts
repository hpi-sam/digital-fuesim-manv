import type { Type } from 'class-transformer';
import type { Constructor } from '../../utils/index.js';
import { SimulationEvent } from './simulation-event.js';
import { MaterialAvailableEvent } from './material-available.js';
import { NewPatientEvent } from './new-patient.js';
import { PersonnelAvailableEvent } from './personnel-available.js';
import { TickEvent } from './tick.js';
import { VehicleArrivedEvent } from './vehicle-arrived.js';
import { TreatmentsTimerEvent } from './treatments-timer-event.js';
import { TreatmentProgressChangedEvent } from './treatment-progress-changed.js';
import { CollectInformationEvent } from './collect.js';
import { StartCollectingInformationEvent } from './start-collecting.js';
import { ResourceRequiredEvent } from './resources-required.js';
import { VehiclesSentEvent } from './vehicles-sent.js';
import { TryToDistributeEvent } from './try-to-distribute.js';
import { VehicleTransferSuccessfulEvent } from './vehicle-transfer-successful.js';
import { TransferConnectionMissingEvent } from './transfer-connection-missing.js';
import { SendRequestEvent } from './send-request.js';
import { LeaderChangedEvent } from './leader-changed.js';
import { MaterialRemovedEvent } from './material-removed.js';
import { PersonnelRemovedEvent } from './personnel-removed.js';
import { PatientRemovedEvent } from './patient-removed.js';
import { VehicleRemovedEvent } from './vehicle-removed.js';
import { TransferPatientsInSpecificVehicleRequestEvent } from './transfer-patients-in-specific-vehicle-request.js';
import { TransferSpecificVehicleRequestEvent } from './transfer-specific-vehicle-request.js';
import { TransferVehiclesRequestEvent } from './transfer-vehicles-request.js';
import { TransferPatientsRequestEvent } from './transfer-patients-request.js';
import { RequestReceivedEvent } from './request-received.js';
import { StartTransferEvent } from './start-transfer.js';
import { DoTransferEvent } from './do-transfer.js';
import { PatientTransferToHospitalSuccessfulEvent } from './patient-transfer-to-hospital-successful.js';
import { PatientCategoryTransferToHospitalFinishedEvent } from './patient-category-transfer-to-hospital-finished.js';
import { TryToSendToHospitalEvent } from './try-to-send-to-hospital.js';
import { AskForPatientDataEvent } from './ask-for-patient-data-event.js';
import { PatientsCountedEvent } from './patients-counted.js';

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
    TryToSendToHospitalEvent,
    AskForPatientDataEvent,
    PatientsCountedEvent,
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
    tryToSendToHospitalEvent: TryToSendToHospitalEvent,
    askForPatientDataEvent: AskForPatientDataEvent,
    patientsCountedEvent: PatientsCountedEvent,
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
