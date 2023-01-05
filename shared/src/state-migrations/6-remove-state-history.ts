import type { Action } from '../store';
import type { Migration } from './migration-functions';

export const removeStateHistory6: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            const actionType = (action as Action | null)?.type;
            if (
                actionType === '[Exercise] Pause' ||
                actionType === '[Exercise] Start'
            ) {
                delete (action as { timestamp?: number }).timestamp;
            }
        });
    },
    state: (state) => {
        interface StatusHistoryEntry {
            status: 'paused' | 'running';
        }
        const oldState = state as { statusHistory?: StatusHistoryEntry[] };
        const currentStatus =
            oldState.statusHistory?.[oldState.statusHistory.length - 1]
                ?.status ?? 'notStarted';
        delete oldState.statusHistory;
        (
            state as { currentStatus: 'notStarted' | 'paused' | 'running' }
        ).currentStatus = currentStatus;
    },
};
