import type { Migration } from './migration-functions';

export const addPatientStatusTags25: Migration = {
    action: (_intermediaryState, action) => {
        const actionType = (action as { type: string }).type;

        if (actionType === '[Patient] Add patient') {
            const typedAction = action as {
                patient: {
                    patientStatusCode: { tags: 'P'[] | undefined };
                };
            };
            typedAction.patient.patientStatusCode.tags = [];
        }

        return true;
    },
    state: (state) => {
        const typedState = state as {
            patients: {
                [patientId: string]: {
                    patientStatusCode: { tags: 'P'[] | undefined };
                };
            };
            patientCategories: { name: { tags: 'P'[] | undefined } }[];
        };

        Object.values(typedState.patients).forEach((patient) => {
            patient.patientStatusCode.tags = [];
        });

        typedState.patientCategories.forEach((status) => {
            status.name.tags = [];
        });
    },
};
