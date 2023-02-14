import type { SimulatedRegion } from '../../models';
import type { ExerciseState } from '../../state';
import type { Constructor, Mutable, UUID } from '../../utils';
import type { ExerciseSimulationEvent } from '../events';

export class SimulationBehaviorState {
    readonly type!: `${string}Behavior`;
    readonly id!: UUID;
}

export interface SimulationBehavior<S extends SimulationBehaviorState> {
    readonly behaviorState: Constructor<S>;
    readonly handleEvent: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<S>,
        event: Mutable<ExerciseSimulationEvent>
    ) => void;
}
