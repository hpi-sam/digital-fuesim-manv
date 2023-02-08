import type { SimulatedRegion } from '../../models';
import type { ExerciseState } from '../../state';
import type { Mutable, UUID } from '../../utils';

export interface SimulationActivityState {
    readonly type: `${string}Activity`;
    readonly id: UUID;
}

export interface SimulationActivity<A extends SimulationActivityState> {
    readonly tick: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        activityState: Mutable<A>
    ) => undefined;
}
