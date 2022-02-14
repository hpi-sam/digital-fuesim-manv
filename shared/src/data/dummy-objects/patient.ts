import { Patient } from '../..';
import { defaultPatientTemplates } from '../default-state/patient-templates';

export function generateDummyPatient(): Patient {
    const template = defaultPatientTemplates[0];
    return new Patient(
        template.personalInformation,
        template.visibleStatus,
        template.realStatus,
        ''
    );
}
