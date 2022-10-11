import { createReducer, on } from '@ngrx/store';
import {
    joinExercise,
    jumpToTime,
    leaveExercise,
    startTimeTravel,
    stopTimeTravel,
} from './application.actions';
import { ApplicationState } from './application.state';

export const applicationReducer = createReducer(
    new ApplicationState(),
    on(startTimeTravel, (state, { timeConstraints }) => ({
        ...state,
        ownClientId: undefined,
        timeConstraints,
    })),
    // TODO:
    on(stopTimeTravel, (state) => state),
    on(jumpToTime, (state, { exerciseTime }) => ({
        ...state,
        timeConstraints: {
            ...state.timeConstraints!,
            current: exerciseTime,
        },
    })),
    on(joinExercise, (state, { ownClientId, exerciseId }) => ({
        timeConstraints: undefined,
        exerciseId,
        ownClientId,
    })),
    on(leaveExercise, (state) => ({
        timeConstraints: undefined,
        exerciseId: undefined,
        ownClientId: undefined,
    }))
);
