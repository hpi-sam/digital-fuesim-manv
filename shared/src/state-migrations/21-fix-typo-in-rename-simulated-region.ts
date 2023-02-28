import type { Migration } from './migration-functions';

export const fixTypoInRenameSimulatedRegion21: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            const typedAction = action as { type: string };
            if (
                typedAction.type === '[SimulatedRegion] Rename simulatedRegion'
            ) {
                typedAction.type = '[SimulatedRegion] Rename simulated region';
            }
        });
    },
    state: null,
};
