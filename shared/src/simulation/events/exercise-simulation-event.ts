import type { Constructor } from '../../utils';
import { TickEvent } from './tick';
import { VehicleArrivedEvent } from './vehicle-arrived';

export const simulationEvents = {
    TickEvent,
    VehicleArrivedEvent,
};

export type ExerciseSimulationEvent = InstanceType<
    (typeof simulationEvents)[keyof typeof simulationEvents]
>;

type ExerciseSimulationEventDictionary = {
    [EventType in ExerciseSimulationEvent as EventType['type']]: Constructor<EventType>;
};

export const simulationEventDictionary: ExerciseSimulationEventDictionary = {
    tickEvent: TickEvent,
    vehicleArrivedEvent: VehicleArrivedEvent,
};
