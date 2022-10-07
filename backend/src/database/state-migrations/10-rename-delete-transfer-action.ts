import type { Action, Mutable } from 'digital-fuesim-manv-shared';
import type { Migration } from './migrations';

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
