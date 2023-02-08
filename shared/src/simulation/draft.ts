import { UUID } from '../utils';

// State, connected to SimulatedRegion
class SimulatedSomething {
    public readonly inEvents!: SimulationEvent[];
    public readonly behaviors!: SimulationBehavior[];
    public readonly activities!: SimulationActivity[];

    // called for each simulated region in deterministic order
    static tick() {
        // trigger behaviors independent of events (i.e. using special event)
        // handle events using behaviors

        // tick all activities
    }
}

interface SimulationEvent {
    type: string;
    state: any;
}

interface SimulationBehavior {
    readonly type: string;
    readonly state: any;
}

interface SimulationActivity {
    readonly type: string;
}

class AddElementToSimulatedRegionEvent implements SimulationEvent {
    public readonly type = 'AddElementToSimulatedRegionEvent';
    public readonly elementType!: any;
    public readonly elementId!: UUID;
}

class UnloadVehiclesBehavior implements SimulationBehavior {
    public readonly type = 'UnloadVehiclesBehavior';
    public readonly state: any;
    static handle(event: Event): boolean {
        if (event.type != 'AddElementToSimulatedRegionEvent') {
            return false;
        }

        return true;
    }
}
