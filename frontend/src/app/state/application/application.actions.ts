import { createAction } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import type { TimeConstraints } from 'src/app/core/time-travel-helper';

/**
 * Applies the given action from the server to the exercise state in the frontend.
 */
export const startTimeTravel = createAction(
    '[Application] Start time travel',
    (timeConstraints: TimeConstraints) => ({ timeConstraints })
);

export const stopTimeTravel = createAction('[Application] Stop time travel');
export const jumpToTime = createAction(
    '[Application] Jump to time',
    (exerciseTime: number) => ({ exerciseTime })
);

export const joinExercise = createAction(
    '[Application] Join exercise',
    (ownClientId: UUID, exerciseId: UUID) => ({ ownClientId, exerciseId })
);

export const leaveExercise = createAction('[Application] Leave exercise');
