// TODO: Why is no direct import possible?
import type { Action } from 'digital-fuesim-manv-shared/dist/store/action-reducer';
import type { Migration } from './migrations';

export const removeSetParticipantIdAction3: Migration = {
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
