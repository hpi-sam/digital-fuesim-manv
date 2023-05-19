/**
 * This file should contain helper function to build tags for a specific category.
 * Their input should always be the current state and the specifier,
 * and they should figure out the color and name for the tag by themselves.
 */

import type { ExerciseState } from '../../state';
import { getElement } from '../../store/action-reducers/utils';
import type { UUID } from '../../utils';
import type { Mutable } from '../../utils/immutability';
import { Tag } from '../tag';
import { statusNames } from './patient-status';
import type { PatientStatus } from './patient-status';

export function createPatientStatusTag(
    _draftState: Mutable<ExerciseState>,
    specifier: PatientStatus
): Tag {
    return new Tag(
        'Sichtungskategorie',
        specifier,
        statusNames[specifier],
        specifier
    );
}

export function createPatientTag(
    draftState: Mutable<ExerciseState>,
    specifier: UUID
): Tag {
    const patient = getElement(draftState, 'patient', specifier);
    return new Tag(
        'Patient',
        'blue-200',
        patient.personalInformation.name,
        specifier
    );
}
