import type { Action, UUID } from 'digital-fuesim-manv-shared';
import type { Migration } from './migrations';

export const removeIsBeingTreated9: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            if ((action as Action | null)?.type === '[Patient] Add patient') {
                delete (action as { patient: { isBeingTreated?: boolean } })
                    .patient.isBeingTreated;
            }
        });
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
