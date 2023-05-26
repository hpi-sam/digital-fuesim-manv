import type { Action } from '../store';
import type { Migration } from './migration-functions';

export const removeSetParticipantIdAction4: Migration = {
    action: (_intermediaryState, action) =>
        (action as Action).type !== '[Exercise] Set Participant Id',
    state: null,
};
