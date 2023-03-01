import { StrictObject } from '../utils';
import type { Migration } from './migration-functions';

export const renameIncorrectPatientImages12: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            if (
                (action as { type: string } | null)?.type ===
                '[Patient] Add patient'
            ) {
                migrateImageProperties(
                    (action as { patient: { image: { url: string } } }).patient
                        .image
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
                migrateImageProperties(patientTemplate.image);
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
        ).forEach((patient) => migrateImageProperties(patient.image));
    },
};

function migrateImageProperties(image: { url: string }) {
    if (image.url === '/assets/male-patient.svg') {
        image.url = '/assets/patient.svg';
    }
}
