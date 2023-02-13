import { TickEvent } from './tick';
import { VehicleArrivedEvent } from './vehicle-arrived';

export const simulationEvents = {
    TickEvent,
    VehicleArrivedEvent,
};

export type ExerciseSimulationEvent = InstanceType<
    (typeof simulationEvents)[keyof typeof simulationEvents]
>;
