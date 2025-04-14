import type { SimulatedRegion } from '../../models/index.js';
import type { ExerciseState } from '../../state.js';
import type { Constructor, Mutable, UUID } from '../../utils/index.js';
import type { ExerciseSimulationEvent } from '../events/index.js';

export class SimulationBehaviorState {
    readonly type!: `${string}Behavior`;
    readonly id!: UUID;
}

export interface SimulationBehavior<
    S extends SimulationBehaviorState,
    C extends Constructor<S> = Constructor<S>,
> {
    readonly behaviorState: C & {
        readonly create: (...args: ConstructorParameters<C>) => S;
    };
    readonly handleEvent: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<S>,
        event: Mutable<ExerciseSimulationEvent>
    ) => void;
    readonly onRemove?: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<S>
    ) => void;
}
