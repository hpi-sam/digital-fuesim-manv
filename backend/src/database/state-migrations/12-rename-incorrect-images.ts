import { StrictObject } from 'digital-fuesim-manv-shared';
import type { Migration } from './migrations';

export const renameIncorrectPatientImages12: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            if (
                (action as { type: string } | null)?.type ===
                '[Patient] Add patient'
            ) {
                migratePatient(
                    (action as { patient: { image: { url: string } } }).patient
                );
            }
        });
    },
    state: (state) => {
        (
            state as {
                patientCategories: {
                    patientTemplates: { image: { url: string } }[];
                }[];
            }
        ).patientCategories.forEach((patientCategory) =>
            patientCategory.patientTemplates.forEach((patientTemplate) => {
                if (patientTemplate.image.url === '/assets/male-patient.svg') {
                    patientTemplate.image.url = '/assets/patient.svg';
                }
            })
        );
        StrictObject.values(
            (
                state as {
                    patients: {
                        readonly [key: string]: { image: { url: string } };
                    };
                }
            ).patients
        ).forEach((patient) => migratePatient(patient));
    },
};

function migratePatient(patient: { image: { url: string } }) {
    migrateImageProperties(patient.image);
}

function migrateImageProperties(image: { url: string }) {
    if (image.url === '/assets/male-patient.svg') {
        image.url = '/assets/patient.svg';
    }
}
