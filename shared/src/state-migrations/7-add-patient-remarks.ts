import type { Action } from '../store';
import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

export const addPatientRemarks7: Migration = {
    action: (_intermediaryState, action) => {
        if ((action as Action).type === '[Patient] Add patient') {
            (action as { patient: { remarks: string } }).patient.remarks = '';
        }
        return true;
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
