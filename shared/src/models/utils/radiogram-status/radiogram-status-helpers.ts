import type { RadiogramAcceptedStatus } from './radiogram-accepted-status';
import type { RadiogramDoneStatus } from './radiogram-done-status';
import type { RadiogramStatus } from './radiogram-status';
import type { RadiogramUnreadStatus } from './radiogram-unread-status';
import type { WithRadiogramStatus } from './with-radiogram-status';

export function isUnread(withRadiogramStatus: WithRadiogramStatus) {
    return isUnreadRadiogramStatus(withRadiogramStatus.radiogramStatus);
}

export function isAccepted(withRadiogramStatus: WithRadiogramStatus) {
    return isAcceptedRadiogramStatus(withRadiogramStatus.radiogramStatus);
}

export function isDone(withRadiogramStatus: WithRadiogramStatus) {
    return isDoneRadiogramStatus(withRadiogramStatus.radiogramStatus);
}

export function currentParticipantIdOf(
    withRadiogramStatus: WithRadiogramStatus
) {
    if (isAccepted(withRadiogramStatus)) {
        return participantIdOfRadiogramStatus(
            withRadiogramStatus.radiogramStatus
        );
    }
    throw new Error('Unknown radiogram status type');
}

export function isUnreadRadiogramStatus(
    radiogramStatus: RadiogramStatus
): radiogramStatus is RadiogramUnreadStatus {
    return radiogramStatus.type === 'unread';
}
export function isAcceptedRadiogramStatus(
    radiogramStatus: RadiogramStatus
): radiogramStatus is RadiogramAcceptedStatus {
    return radiogramStatus.type === 'accepted';
}
export function isDoneRadiogramStatus(
    radiogramStatus: RadiogramStatus
): radiogramStatus is RadiogramDoneStatus {
    return radiogramStatus.type === 'done';
}

export function participantIdOfRadiogramStatus(
    radiogramStatus: RadiogramStatus
) {
    if (isAcceptedRadiogramStatus(radiogramStatus)) {
        return radiogramStatus.participantId;
    }
    throw new TypeError(
        `Expected radiogram status to be accepted. Was of type ${radiogramStatus.type}.`
    );
}
