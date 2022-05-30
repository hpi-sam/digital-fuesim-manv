import { FunctionParameters, Patient, PatientHealthState } from '../../models';
import { defaultPatientTemplates } from '../default-state/patient-templates';

export function generateDummyPatient(): Patient {
    const template = defaultPatientTemplates[0];
    const healthState = PatientHealthState.create(
        FunctionParameters.create(-10_000, 0, 0, 0),
        []
    );
    return Patient.create(
        {
            address: 'Musterstraße 1',
            name: 'John Doe',
            birthdate: '1.1.',
        },
        template.biometricInformation,
        'green',
        'green',
        { [healthState.id]: healthState },
        healthState.id,
        template.image,
        template.health
    );
}
