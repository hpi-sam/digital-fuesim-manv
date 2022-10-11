import { createSelector } from '@ngrx/store';
import type { AppState } from '../app.state';
import type { ApplicationState } from './application.state';

const selectApplication = (state: AppState) => state.application;

function createSelectProperty<Key extends keyof ApplicationState>(key: Key) {
    return createSelector(selectApplication, (application) => application[key]);
}
export const selectExerciseId = createSelectProperty('exerciseId');
export const selectOwnClientId = createSelectProperty('ownClientId');
export const selectTimeConstraints = createSelectProperty('timeConstraints');

export const selectIsJoined = createSelector(
    selectOwnClientId,
    (ownClientId) => ownClientId !== undefined
);

export const selectIsTimeTraveling = createSelector(
    selectTimeConstraints,
    (timeConstraints) => timeConstraints !== undefined
);
