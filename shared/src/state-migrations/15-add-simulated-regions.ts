import type { Migration } from './migration-functions';

export const addSimulatedRegions15: Migration = {
    actions: null,
    state: (state: any) => {
        state.simulatedRegions = {};
    },
};
