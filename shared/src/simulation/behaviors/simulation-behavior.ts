import type { SimulatedRegion } from '../../models';
import type { ExerciseState } from '../../state';
import type { Constructor, Mutable, UUID } from '../../utils';
import type { ExerciseSimulationEvent } from '../events';

export interface SimulationBehaviorState {
    readonly type: `${string}Behavior`;
    readonly id: UUID;
}

export interface SimulationBehavior<S extends SimulationBehaviorState> {
    readonly behaviorState: Constructor<S>;
    readonly handleEvent: (
        draftState: Mutable<ExerciseState>,
        event: Mutable<ExerciseSimulationEvent>,
        behaviorState: Mutable<S>,
        simulatedRegion: Mutable<SimulatedRegion>
    ) => void;
}
