import type { Migration } from './migrations';

export const removeStatistics3: Migration = {
    actions: null,
    state: (state) => {
        delete (state as { statistics?: object[] }).statistics;
        return state;
    },
};
