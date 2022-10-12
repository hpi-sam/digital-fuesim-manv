import type { Migration } from './migrations';

export const renameIncorrectPatientImages12: Migration = {
    actions: null,
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
    },
};
