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
import { CollectMaterialCountEvent } from './collect/collect-material-count';
import { CollectPatientCountEvent } from './collect/collect-patient-count';
import { CollectPersonnelCountEvent } from './collect/collect-personnel-count';
import { CollectVehicleCountEvent } from './collect/collect-vehicle-count';
import { CollectTreatmentStatusEvent } from './collect/collect-treatment-status';
import { StartCollectingPatientCountEvent } from './collect/start-collecting-patient-count';
import { StartCollectingMaterialCountEvent } from './collect/start-collecting-material-count';
import { StartCollectingPersonnelCountEvent } from './collect/start-collecting-personnel-count';
import { StartCollectingTreatmentStatusEvent } from './collect/start-collecting-treatment-status';
import { StartCollectingVehicleCountEvent } from './collect/start-collecting-vehicle-count';

export const simulationEvents = {
    MaterialAvailableEvent,
    NewPatientEvent,
    PersonnelAvailableEvent,
    TickEvent,
    TreatmentProgressChangedEvent,
    TreatmentsTimerEvent,
    VehicleArrivedEvent,
    CollectMaterialCountEvent,
    CollectPatientCountEvent,
    CollectPersonnelCountEvent,
    CollectVehicleCountEvent,
    CollectTreatmentStatusEvent,
    StartCollectingPatientCountEvent,
    StartCollectingMaterialCountEvent,
    StartCollectingPersonnelCountEvent,
    StartCollectingVehicleCountEvent,
    StartCollectingTreatmentStatusEvent,
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
    materialCountCollectEvent: CollectMaterialCountEvent,
    patientCountCollectEvent: CollectPatientCountEvent,
    personnelCountCollectEvent: CollectPersonnelCountEvent,
    vehicleCountCollectEvent: CollectVehicleCountEvent,
    treatmentStatusCollectEvent: CollectTreatmentStatusEvent,
    materialCountStartCollectingEvent: StartCollectingMaterialCountEvent,
    patientCountStartCollectingEvent: StartCollectingPatientCountEvent,
    personnelCountStartCollectingEvent: StartCollectingPersonnelCountEvent,
    vehicleCountStartCollectingEvent: StartCollectingVehicleCountEvent,
    treatmentStatusStartCollectingEvent: StartCollectingTreatmentStatusEvent,
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
