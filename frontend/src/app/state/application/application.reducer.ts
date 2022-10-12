import { createReducer, on } from '@ngrx/store';
import {
    joinExercise,
    jumpToTime,
    leaveExercise,
    startTimeTravel,
} from './application.actions';
import { ApplicationState } from './application.state';

export const applicationReducer = createReducer(
    new ApplicationState(),
    on(startTimeTravel, (state, { timeConstraints }) => ({
        ...state,
        mode: 'timeTravel',
        timeConstraints,
    })),
    on(jumpToTime, (state, { exerciseTime }) => ({
        ...state,
        timeConstraints: {
            ...state.timeConstraints!,
            current: exerciseTime,
        },
    })),
    on(joinExercise, (state, { ownClientId, exerciseId, clientName }) => ({
        ...state,
        mode: 'exercise',
        exerciseId,
        ownClientId,
        lastClientName: clientName,
    })),
    on(leaveExercise, (state) => ({
        ...state,
        mode: 'frontPage',
    }))
);
