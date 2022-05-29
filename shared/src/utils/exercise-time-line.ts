import type { ExerciseState } from '../state';
import type { ExerciseAction } from '../store';

export interface ExerciseTimeline {
    readonly initialState: ExerciseState;
    readonly actionsWrappers: readonly {
        readonly action: ExerciseAction;
        readonly time: number;
    }[];
}
