import type { Action } from '../store';
import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

export const removeIsBeingTreated9: Migration = {
    action: (_intermediaryState, action) => {
        if ((action as Action).type === '[Patient] Add patient') {
            delete (action as { patient: { isBeingTreated?: boolean } }).patient
                .isBeingTreated;
        }
        return true;
    },
    state: (state) => {
        const typedState = state as {
            patients: { [patientId: UUID]: { isBeingTreated?: boolean } };
        };
        Object.values(typedState.patients).forEach((patient) => {
            delete patient.isBeingTreated;
        });
    },
};
