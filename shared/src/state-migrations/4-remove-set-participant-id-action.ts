import type { Action } from '../store';
import type { Migration } from './migration-functions';

export const removeSetParticipantIdAction4: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action, index) => {
            if (
                action !== null &&
                (action as Action).type === '[Exercise] Set Participant Id'
            ) {
                actions[index] = null;
            }
        });
    },
    state: null,
};
