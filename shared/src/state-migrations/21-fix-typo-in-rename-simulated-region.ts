import type { Migration } from './migration-functions.js';

export const fixTypoInRenameSimulatedRegion21: Migration = {
    action: (_intermediaryState, action) => {
        const typedAction = action as { type: string };
        if (typedAction.type === '[SimulatedRegion] Rename simulatedRegion') {
            typedAction.type = '[SimulatedRegion] Rename simulated region';
        }
        return true;
    },
    state: null,
};
