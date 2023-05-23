/**
 * This file should contain helper function to build tags for a specific category.
 * Their input should always be the current state and the specifier,
 * and they should figure out the color and name for the tag by themselves.
 */

import type { ExerciseState } from '../../state';
import { getElement } from '../../store/action-reducers/utils/get-element';
import type { UUID } from '../../utils';
import type { Mutable } from '../../utils/immutability';
import { Tag } from '../tag';
import { statusNames } from './patient-status';
import type { PatientStatus } from './patient-status';

export function createPatientStatusTag(
    _draftState: Mutable<ExerciseState>,
    patientStatus: PatientStatus
): Tag {
    return new Tag(
        'Sichtungskategorie',
        patientStatus,
        patientStatus === 'yellow' ? 'black' : 'white',
        statusNames[patientStatus],
        patientStatus
    );
}

export function createPatientTag(
    draftState: Mutable<ExerciseState>,
    patientId: UUID
): Tag {
    const patient = getElement(draftState, 'patient', patientId);
    return new Tag(
        'Patient',
        'cyan',
        'black',
        patient.personalInformation.name,
        patientId
    );
}
