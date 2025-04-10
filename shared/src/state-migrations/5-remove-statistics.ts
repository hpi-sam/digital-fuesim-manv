import type { Migration } from './migration-functions.js';

export const removeStatistics5: Migration = {
    action: null,
    state: (state) => {
        delete (state as { statistics?: object[] }).statistics;
    },
};
