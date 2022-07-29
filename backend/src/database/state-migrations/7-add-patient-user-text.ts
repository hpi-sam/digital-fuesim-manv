import type { Action, UUID } from 'digital-fuesim-manv-shared';
import type { Migration } from './migrations';

export const addPatientUserText7: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            if ((action as Action | null)?.type === '[Patient] Add patient') {
                (action as { patient: { userText: string } }).patient.userText =
                    '';
            }
        });
    },
    state: (state) => {
        const typedState = state as {
            patients: { [patientId: UUID]: { userText: string } };
        };
        Object.values(typedState.patients).forEach((patient) => {
            patient.userText = '';
        });
        return typedState;
    },
};
