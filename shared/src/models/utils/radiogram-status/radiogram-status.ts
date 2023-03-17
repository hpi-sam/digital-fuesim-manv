import type { RadiogramAcceptedStatus } from './radiogram-accepted-status';
import type { RadiogramDoneStatus } from './radiogram-done-status';
import type { RadiogramUnreadStatus } from './radiogram-unread-status';

export type RadiogramStatus =
    | RadiogramAcceptedStatus
    | RadiogramDoneStatus
    | RadiogramUnreadStatus;
