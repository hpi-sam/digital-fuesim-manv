import type { Type } from 'class-transformer';
import type { Constructor } from '../../utils';
import { SimulationEvent } from './simulation-event';
import { MaterialAvailableEvent } from './material-available';
import { NewPatientEvent } from './new-patient';
import { PersonnelAvailableEvent } from './personnel-available';
import { TickEvent } from './tick';
import { VehicleArrivedEvent } from './vehicle-arrived';

export const simulationEvents = {
    MaterialAvailableEvent,
    NewPatientEvent,
    PersonnelAvailableEvent,
    TickEvent,
    VehicleArrivedEvent,
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
    vehicleArrivedEvent: VehicleArrivedEvent,
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
