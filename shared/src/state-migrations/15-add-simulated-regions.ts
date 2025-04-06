import type { Migration } from './migration-functions.js';

export const addSimulatedRegions15: Migration = {
    action: null,
    state: (state: any) => {
        state.simulatedRegions = {};
    },
};
