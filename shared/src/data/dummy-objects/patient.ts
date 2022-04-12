import { FunctionParameters, Patient, PatientHealthState } from '../../models';
import { defaultPatientTemplates } from '../default-state/patient-templates';

export function generateDummyPatient(): Patient {
    const template = defaultPatientTemplates[0];
    const healthState = PatientHealthState.create(
        FunctionParameters.create(-10_000, 0, 0, 0),
        []
    );
    return Patient.fromTemplate({
        ...template,
        healthStates: { [healthState.id]: healthState },
        startingHealthStateId: healthState.id,
    });
}
