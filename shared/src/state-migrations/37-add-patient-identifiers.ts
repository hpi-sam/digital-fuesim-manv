import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

interface Patient {
    id: UUID;
    identifier?: string;
}

export const addPatientIdentifiers37: Migration = {
    action: (_, action) => {
        if ((action as { type: string }).type === '[Patient] Add patient') {
            (action as { patient: Patient }).patient.identifier = '';
        }
        return true;
    },
    state: (state) => {
        const typedState = state as {
            patients: {
                [patientId: UUID]: Patient;
            };
            hospitalPatients: {
                [hospitalPatientId: UUID]: Patient;
            };
            configuration: {
                patientIdentifierPrefix?: string;
            };
            patientCounter?: number;
        };

        typedState.patientCounter ??= 0;

        typedState.configuration.patientIdentifierPrefix ??= '';

        Object.values(typedState.patients)
            .sort((a, b) => a.id.localeCompare(b.id))
            .forEach((patient) => {
                typedState.patientCounter!++;
                const paddedCounter = String(
                    typedState.patientCounter
                ).padStart(4, '0');
                patient.identifier = `${typedState.configuration.patientIdentifierPrefix}${paddedCounter}`;
            });

        Object.values(typedState.hospitalPatients).forEach(
            (hospitalPatient) => {
                hospitalPatient.identifier = '';
            }
        );
    },
};
