import { FunctionParameters, Patient, PatientHealthState } from '../../models';
import { defaultPatientTemplates } from '../default-state/patient-templates';

export function generateDummyPatient(): Patient {
    const template = defaultPatientTemplates[0];
    const healthState = new PatientHealthState(
        new FunctionParameters(-10_000, 0, 0, 0),
        []
    );
    template.healthStates = { [healthState.id]: healthState };
    template.startingHealthStateId = healthState.id;
    return Patient.fromTemplate(template);
}
