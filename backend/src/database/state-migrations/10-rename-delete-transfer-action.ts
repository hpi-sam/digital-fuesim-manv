import type { Action } from 'digital-fuesim-manv-shared';
import type { DeleteTransferAction } from 'digital-fuesim-manv-shared/dist/store/action-reducers/transfer';
import type { Migration } from './migrations';

export const renameDeleteTransferAction10: Migration = {
    actions: (_initialState, actions) => {
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i] as Action | null;
            if (action?.type === '[Transfer] delete transfer') {
                const oldAction = action as unknown as {
                    elementId: string;
                    elementType: 'personnel' | 'vehicles';
                    targetTransferPointId: string;
                };
                const newAction: DeleteTransferAction = {
                    type: '[Transfer] Delete transfer',
                    elementId: oldAction.elementId,
                    elementType: oldAction.elementType,
                    targetTransferPointId: oldAction.targetTransferPointId,
                };

                actions[i] = newAction;
            }
        }
    },
    state: null,
};
