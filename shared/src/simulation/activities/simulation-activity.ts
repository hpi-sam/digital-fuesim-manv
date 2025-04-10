import type { SimulatedRegion } from '../../models/index.js';
import type { ExerciseState } from '../../state.js';
import type { Constructor, Mutable, UUID } from '../../utils/index.js';

export class SimulationActivityState {
    readonly type!: `${string}Activity`;
    readonly id!: UUID;
}

export interface SimulationActivity<S extends SimulationActivityState> {
    readonly activityState: Constructor<S>;
    readonly tick: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        activityState: Mutable<S>,
        tickInterval: number,
        terminate: () => void
    ) => void;
    readonly onTerminate?: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        activityId: UUID
    ) => void;
}
