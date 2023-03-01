import type { Action } from '../store';
import type { Mutable } from '../utils';
import type { Migration } from './migration-functions';

export const renameDeleteTransferAction10: Migration = {
    actions: (_initialState, actions) => {
        for (const action of actions as (Mutable<Action> | null)[]) {
            if (action?.type === '[Transfer] delete transfer') {
                action.type = '[Transfer] Finish transfer';
            }
        }
    },
    state: null,
};
