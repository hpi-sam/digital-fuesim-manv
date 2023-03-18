import type { ExerciseRadiogram } from '../exercise-radiogram';
import type { ExerciseRadiogramStatus } from './exercise-radiogram-status';
import type { RadiogramAcceptedStatus } from './radiogram-accepted-status';
import type { RadiogramDoneStatus } from './radiogram-done-status';
import type { RadiogramUnreadStatus } from './radiogram-unread-status';

export function isUnread(radiogram: ExerciseRadiogram) {
    return isUnreadRadiogramStatus(radiogram.status);
}

export function isAccepted(radiogram: ExerciseRadiogram) {
    return isAcceptedRadiogramStatus(radiogram.status);
}

export function isDone(radiogram: ExerciseRadiogram) {
    return isDoneRadiogramStatus(radiogram.status);
}

export function currentParticipantIdOf(radiogram: ExerciseRadiogram) {
    if (isAccepted(radiogram)) {
        return participantIdOfRadiogramStatus(radiogram.status);
    }
    throw new TypeError(
        `Expected radiogram status to be accepted. Was of type ${radiogram.status.type}.`
    );
}

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
