import type { Action } from '../store';
import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

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
