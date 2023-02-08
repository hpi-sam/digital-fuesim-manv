import type { SimulatedRegion } from '../../models';
import type { ExerciseState } from '../../state';
import type { Constructor, Mutable, UUID } from '../../utils';
import type { SimulationEvent } from '../events/simulation-event';

export interface SimulationBehaviorState {
    readonly type: `${string}Behavior`;
    readonly id: UUID;
}

export interface SimulationBehavior<B extends SimulationBehaviorState> {
    readonly behaviorState: Constructor<B>;
    readonly handle: (
        draftState: Mutable<ExerciseState>,
        event: SimulationEvent,
        behaviorState: B,
        simulatedRegion: SimulatedRegion,
    ) => void;
}
