import type { Migration } from './migration-functions';

export const removeStatistics5: Migration = {
    action: null,
    state: (state) => {
        delete (state as { statistics?: object[] }).statistics;
    },
};
