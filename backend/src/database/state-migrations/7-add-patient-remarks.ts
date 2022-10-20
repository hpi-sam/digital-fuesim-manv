import type { Action, UUID } from 'digital-fuesim-manv-shared';
import type { Migration } from './migrations';

export const addPatientRemarks7: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            if ((action as Action | null)?.type === '[Patient] Add patient') {
                (action as { patient: { remarks: string } }).patient.remarks =
                    '';
            }
        });
    },
    state: (state) => {
        const typedState = state as {
            patients: { [patientId: UUID]: { remarks: string } };
        };
        Object.values(typedState.patients).forEach((patient) => {
            patient.remarks = '';
        });
    },
};
