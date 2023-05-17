import type { Migration } from './migration-functions';

export const addCatchAllHospital34: Migration = {
    action: null,
    state: (state) => {
        const typedState = state as {
            hospitals: {
                [key: string]: any;
            };
        };
        const catchAllHospitalId = '00000000-0000-4000-8000-000000000000';
        typedState.hospitals[catchAllHospitalId] = {
            type: 'hospital',
            id: catchAllHospitalId,
            name: 'Beliebiges Krankenhaus',
            transportDuration: 60 * 60 * 1000,
            patientIds: {},
        };
    },
};
