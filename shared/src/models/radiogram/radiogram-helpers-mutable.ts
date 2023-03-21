import type { ExerciseState } from '../../state';
import type { Mutable, UUID } from '../../utils';
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
}

export function acceptRadiogram(
    draftState: Mutable<ExerciseState>,
    radiogramId: UUID,
    clientId: UUID
) {
    const radiogram = draftState.radiograms[radiogramId]!;
    radiogram.status = {
        type: 'acceptedRadiogramStatus',
        publishTime: publishTimeOf(radiogram),
        clientId,
    };
}

export function markRadiogramDone(
    draftState: Mutable<ExerciseState>,
    radiogramId: UUID
) {
    const radiogram = draftState.radiograms[radiogramId]!;
    radiogram.status = {
        type: 'doneRadiogramStatus',
        publishTime: publishTimeOf(radiogram),
    };
}
