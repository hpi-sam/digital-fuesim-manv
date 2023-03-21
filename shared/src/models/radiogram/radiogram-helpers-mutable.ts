import type { ExerciseState } from '../../state';
import type { Mutable, UUID } from '../../utils';
import { cloneDeepMutable } from '../../utils';
import type { ExerciseRadiogram } from './exercise-radiogram';
import { publishTimeOf } from './radiogram-helpers';
import { RadiogramAcceptedStatus } from './status/radiogram-accepted-status';
import { RadiogramDoneStatus } from './status/radiogram-done-status';
import { RadiogramUnreadStatus } from './status/radiogram-unread-status';

export function publishRadiogram(
    draftState: Mutable<ExerciseState>,
    radiogram: Mutable<ExerciseRadiogram>
) {
    radiogram.status = cloneDeepMutable(
        RadiogramUnreadStatus.create(draftState.currentTime)
    );
    draftState.radiograms[radiogram.id] = radiogram;
}

export function acceptRadiogram(
    draftState: Mutable<ExerciseState>,
    radiogramId: UUID,
    clientId: UUID
) {
    const radiogram = draftState.radiograms[radiogramId]!;
    radiogram.status = cloneDeepMutable(
        RadiogramAcceptedStatus.create(clientId, publishTimeOf(radiogram))
    );
}

export function markRadiogramDone(
    draftState: Mutable<ExerciseState>,
    radiogramId: UUID
) {
    const radiogram = draftState.radiograms[radiogramId]!;
    radiogram.status = cloneDeepMutable(
        RadiogramDoneStatus.create(publishTimeOf(radiogram))
    );
}
