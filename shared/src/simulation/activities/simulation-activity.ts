import type { SimulatedRegion } from '../../models';
import type { ExerciseState } from '../../state';
import type { Constructor, Mutable, UUID } from '../../utils';

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
