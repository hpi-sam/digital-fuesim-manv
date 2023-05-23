import type { ExerciseState } from '../../state';
import { getExerciseRadiogramById } from '../../store/action-reducers/utils/get-element';
import { logRadiogram } from '../../store/action-reducers/utils/log';
import type { Mutable, UUID } from '../../utils';
import { createRadiogramActionTag } from '../utils/tag-helpers';
import type { ExerciseRadiogram } from './exercise-radiogram';
import { publishTimeOf } from './radiogram-helpers';

export function publishRadiogram(
    draftState: Mutable<ExerciseState>,
    radiogram: Mutable<ExerciseRadiogram>
) {
    radiogram.status = {
        type: 'unreadRadiogramStatus',
        publishTime: draftState.currentTime,
    };
    draftState.radiograms[radiogram.id] = radiogram;
    logRadiogram(
        draftState,
        [createRadiogramActionTag(draftState, radiogram.status.type)],
        'Der Funkspruch wurde veröffentlicht',
        radiogram.id
    );
}

export function acceptRadiogram(
    draftState: Mutable<ExerciseState>,
    radiogramId: UUID,
    clientId: UUID
) {
    const radiogram = getExerciseRadiogramById(draftState, radiogramId);
    radiogram.status = {
        type: 'acceptedRadiogramStatus',
        publishTime: publishTimeOf(radiogram),
        clientId,
    };
    logRadiogram(
        draftState,
        [createRadiogramActionTag(draftState, radiogram.status.type)],
        'Der Funkspruch wurde zur Durchsage angenommen',
        radiogram.id
    );
}

export function markRadiogramDone(
    draftState: Mutable<ExerciseState>,
    radiogramId: UUID
) {
    const radiogram = getExerciseRadiogramById(draftState, radiogramId);
    radiogram.status = {
        type: 'doneRadiogramStatus',
        publishTime: publishTimeOf(radiogram),
    };
    logRadiogram(
        draftState,
        [createRadiogramActionTag(draftState, radiogram.status.type)],
        'Der Funkspruch wurde durchgesagt',
        radiogram.id
    );
}
