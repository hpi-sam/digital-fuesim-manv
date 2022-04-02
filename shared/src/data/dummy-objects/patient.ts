import { FunctionParameters, Patient, PatientHealthState } from '../../models';
import { healthPointsDefaults } from '../../models/utils';
import { defaultPatientTemplates } from '../default-state/patient-templates';

export function generateDummyPatient(): Patient {
    const template = defaultPatientTemplates[0];
    const healthState = new PatientHealthState(
        new FunctionParameters(-10_000, 0, 0, 0),
        []
    );
    return new Patient(
        template.personalInformation,
        template.visibleStatus,
        template.realStatus,
        { [healthState.id]: healthState },
        healthState.id,
        template.image,
        healthPointsDefaults.max
    );
}
