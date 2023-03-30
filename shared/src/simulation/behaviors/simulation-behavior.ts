import type { SimulatedRegion } from '../../models';
import type { ExerciseState } from '../../state';
import type { Constructor, Mutable, UUID } from '../../utils';
import type { ExerciseSimulationEvent } from '../events';

export class SimulationBehaviorState {
    readonly type!: `${string}Behavior`;
    readonly id!: UUID;
}

export interface SimulationBehavior<
    S extends SimulationBehaviorState,
    C extends Constructor<S> = Constructor<S>
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
