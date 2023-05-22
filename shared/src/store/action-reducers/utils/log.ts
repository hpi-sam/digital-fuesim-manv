import { LogEntry } from '../../../models/log-entry';
import type { ExerciseRadiogram } from '../../../models/radiogram';
import type { Tag } from '../../../models/tag';
import {
    createPatientStatusTag,
    createPatientTag,
    createRadiogramTypeTag,
    createSimulatedRegionTag,
    createTransferPointTag,
    createTreatmentProgressTag,
} from '../../../models/utils/tag-helpers';
import type { ExerciseState } from '../../../state';
import type { UUID } from '../../../utils';
import type { Mutable } from '../../../utils/immutability';
import { getElement, getExerciseRadiogramById } from './get-element';

export function logPatient(
    state: Mutable<ExerciseState>,
    additionalTags: Tag[],
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

export function logRadiogram(
    state: Mutable<ExerciseState>,
    additionalTags: Tag[],
    description: string,
    radiogramId: UUID
) {
    if (!logActive(state)) return;

    const radiogram = getExerciseRadiogramById(state, radiogramId);

    state.logEntries!.push(
        new LogEntry(
            description,
            [
                ...additionalTags,
                ...createTagsForRadiogramType(state, radiogram),
                createRadiogramTypeTag(state, radiogramId),
                createSimulatedRegionTag(state, radiogram.simulatedRegionId),
            ],
            state.currentTime
        )
    );
}

function createTagsForRadiogramType(
    state: Mutable<ExerciseState>,
    radiogram: ExerciseRadiogram
): Tag[] {
    switch (radiogram.type) {
        case 'missingTransferConnectionRadiogram':
            return [
                createTransferPointTag(state, radiogram.targetTransferPointId),
            ];
        case 'treatmentStatusRadiogram':
            return [
                createTreatmentProgressTag(state, radiogram.treatmentStatus),
            ];
        default:
            return [];
    }
}

function logActive(state: Mutable<ExerciseState>): boolean {
    return !!state.logEntries;
}
