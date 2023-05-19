import { LogEntry } from '../../../models/log-entry';
import type { Tag } from '../../../models/tag';
import {
    createPatientStatusTag,
    createPatientTag,
} from '../../../models/utils/tag-helpers';
import type { ExerciseState } from '../../../state';
import type { UUID } from '../../../utils';
import type { Mutable } from '../../../utils/immutability';
import { getElement } from '.';

export function logPatient(
    state: Mutable<ExerciseState>,
    additionalTags: Tag [],
    description: string,
    patientId: UUID
) {
    if (!logActive(state)) return;

    const patient = getElement(state, 'patient', patientId);

    state.logEntries!.push(
        new LogEntry(
            description,
            [
                ...additionalTags,
                createPatientTag(state, patient.id),
                createPatientStatusTag(state, patient.pretriageStatus),
            ],
            state.currentTime
        )
    );
}

function logActive(state: Mutable<ExerciseState>): boolean {
    return !!state.logEntries;
}
