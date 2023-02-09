import type { SimulatedRegion } from '../../models';
import type { ExerciseState } from '../../state';
import type { Constructor, Mutable, UUID } from '../../utils';

export interface SimulationActivityState {
    readonly type: `${string}Activity`;
    readonly id: UUID;
}

export interface SimulationActivity<S extends SimulationActivityState> {
    readonly activityState: Constructor<S>;
    // TODO: make argument order consistent with SimulationBehavior.handleEvent
    readonly tick: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        activityState: Mutable<S>,
        tickInterval: number
    ) => void;
}
