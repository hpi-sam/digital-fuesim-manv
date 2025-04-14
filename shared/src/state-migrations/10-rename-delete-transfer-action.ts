import type { Migration } from './migration-functions.js';

export const renameDeleteTransferAction10: Migration = {
    action: (_intermediaryState, action) => {
        const typedAction = action as { type: string };
        if (typedAction.type === '[Transfer] delete transfer') {
            typedAction.type = '[Transfer] Finish transfer';
        }
        return true;
    },
    state: null,
};
