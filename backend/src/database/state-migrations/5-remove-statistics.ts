import type { Migration } from './migrations';

export const removeStatistics5: Migration = {
    actions: null,
    state: (state) => {
        delete (state as { statistics?: object[] }).statistics;
        return state;
    },
};
