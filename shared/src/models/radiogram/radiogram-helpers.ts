import type { ExerciseRadiogram } from './exercise-radiogram.js';
import {
    isUnreadRadiogramStatus,
    isAcceptedRadiogramStatus,
    isDoneRadiogramStatus,
    isUnpublishedRadiogramStatus,
    participantIdOfRadiogramStatus,
    publishTimeOfRadiogramStatus,
} from './status/radiogram-status-helpers.js';

export function isUnread(radiogram: ExerciseRadiogram) {
    return isUnreadRadiogramStatus(radiogram.status);
}

export function isAccepted(radiogram: ExerciseRadiogram) {
    return isAcceptedRadiogramStatus(radiogram.status);
}

export function isDone(radiogram: ExerciseRadiogram) {
    return isDoneRadiogramStatus(radiogram.status);
}

export function isUnpublished(radiogram: ExerciseRadiogram) {
    return isUnpublishedRadiogramStatus(radiogram.status);
}

export function currentParticipantIdOf(radiogram: ExerciseRadiogram) {
    if (isAccepted(radiogram)) {
        return participantIdOfRadiogramStatus(radiogram.status);
    }
    throw new TypeError(
        `Expected radiogram status to be accepted. Was of type ${radiogram.status.type}.`
    );
}

export function publishTimeOf(radiogram: ExerciseRadiogram) {
    if (!isUnpublished(radiogram)) {
        return publishTimeOfRadiogramStatus(radiogram.status);
    }
    throw new TypeError(
        `Expected radiogram status to be not be unpublished. Was of type ${radiogram.status.type}.`
    );
}
