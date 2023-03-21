import type { ExerciseRadiogramStatus } from './exercise-radiogram-status';
import type { RadiogramAcceptedStatus } from './radiogram-accepted-status';
import type { RadiogramDoneStatus } from './radiogram-done-status';
import type { RadiogramUnpublishedStatus } from './radiogram-unpublished-status';
import type { RadiogramUnreadStatus } from './radiogram-unread-status';

export function isUnreadRadiogramStatus(
    radiogramStatus: ExerciseRadiogramStatus
): radiogramStatus is RadiogramUnreadStatus {
    return radiogramStatus.type === 'unreadRadiogramStatus';
}
export function isAcceptedRadiogramStatus(
    radiogramStatus: ExerciseRadiogramStatus
): radiogramStatus is RadiogramAcceptedStatus {
    return radiogramStatus.type === 'acceptedRadiogramStatus';
}
export function isDoneRadiogramStatus(
    radiogramStatus: ExerciseRadiogramStatus
): radiogramStatus is RadiogramDoneStatus {
    return radiogramStatus.type === 'doneRadiogramStatus';
}

export function isUnpublishedRadiogramStatus(
    radiogramStatus: ExerciseRadiogramStatus
): radiogramStatus is RadiogramUnpublishedStatus {
    return radiogramStatus.type === 'unpublishedRadiogramStatus';
}

export function participantIdOfRadiogramStatus(
    radiogramStatus: ExerciseRadiogramStatus
) {
    if (isAcceptedRadiogramStatus(radiogramStatus)) {
        return radiogramStatus.clientId;
    }
    throw new TypeError(
        `Expected radiogram status to be accepted. Was of type ${radiogramStatus.type}.`
    );
}

export function publishTimeOfRadiogramStatus(
    radiogramStatus: ExerciseRadiogramStatus
) {
    if (!isUnpublishedRadiogramStatus(radiogramStatus)) {
        return radiogramStatus.publishTime;
    }
    throw new TypeError(
        `Expected radiogram status to be not be unpublished. Was of type ${radiogramStatus.type}.`
    );
}
