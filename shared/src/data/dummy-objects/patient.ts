import { Patient, PatientHealthState } from '../../models';
import { PatientStatusCode } from '../../models/utils/patient-status-code';
import {
    Breathing,
    Circulation,
    Disability,
    Exposure,
    PretriageInformation,
} from '../../models/utils/pretriage-information';
import { defaultPatientCategories } from '../default-state/patient-templates';

export function generateDummyPatient(): Patient {
    const template = defaultPatientCategories[0]!.patientTemplates[0]!;
    const healthState = PatientHealthState.create(
        'StateName',
        PretriageInformation.create(
            '',
            '',
            true,
            '',
            '',
            Breathing.create('', '', ''),
            Circulation.create('', '', '', ''),
            Disability.create('', '', '', '', '', ''),
            Exposure.create('', '')
        ),
        'green',
        []
    );
    return Patient.create(
        {
            address: 'Musterstraße 1',
            name: 'John Doe',
            birthdate: '1.1.',
        },
        template.biometricInformation,
        PatientStatusCode.create('ZAZAZA'),
        'green',
        { [healthState.name]: healthState },
        healthState.name,
        template.image
    );
}
