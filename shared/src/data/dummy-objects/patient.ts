import {
    FunctionParameters,
    Patient,
    PatientHealthState,
} from '../../models/index.js';
import { MapCoordinates } from '../../models/utils/position/map-coordinates.js';
import { MapPosition } from '../../models/utils/position/map-position.js';
import { PatientStatusCode } from '../../models/utils/patient-status-code.js';
import { defaultPatientCategories } from '../default-state/patient-templates.js';

export function generateDummyPatient(): Patient {
    const template = defaultPatientCategories[0]!.patientTemplates[0]!;
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
        template.pretriageInformation,
        PatientStatusCode.create('ZAZAZA'),
        'green',
        'green',
        { [healthState.id]: healthState },
        healthState.id,
        template.image,
        template.health,
        '',
        MapPosition.create(MapCoordinates.create(0, 0))
    );
}
