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

export const jumpToTime = createAction(
    '[Application] Jump to time',
    (exerciseTime: number) => ({ exerciseTime })
);

export const joinExercise = createAction(
    '[Application] Join exercise',
    (ownClientId: UUID, exerciseId: UUID, clientName: string) => ({
        ownClientId,
        exerciseId,
        clientName,
    })
);

export const leaveExercise = createAction('[Application] Leave exercise');
