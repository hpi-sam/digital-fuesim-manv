import type { ExerciseState } from '../state';
import type { ExerciseAction } from '../store';
import type { UUID } from './uuid';

export interface ExerciseTimeline {
    readonly initialState: ExerciseState;
    readonly actionsWrappers: readonly {
        readonly action: ExerciseAction;
        /**
         * This value is `null` iff the action was proposed by the server, otherwise it's the id of the proposing client in the state at that time.
         */
        readonly emitterId: UUID | null;
        readonly time: number;
    }[];
}
