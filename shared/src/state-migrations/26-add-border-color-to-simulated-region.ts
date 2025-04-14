import type { Migration } from './migration-functions.js';

export const addSimulatedRegionBorderColor26: Migration = {
    action: (_intermediaryState, action) => {
        const actionType = (action as { type: string }).type;

        if (actionType === '[SimulatedRegion] Add simulated region') {
            const typedAction = action as {
                simulatedRegion: {
                    borderColor: string;
                };
            };
            typedAction.simulatedRegion.borderColor = '#cccc00';
        }

        return true;
    },
    state: (state) => {
        const typedState = state as {
            simulatedRegions: {
                [simulatedRegionId: string]: {
                    borderColor: string;
                };
            };
        };

        Object.values(typedState.simulatedRegions).forEach((region) => {
            region.borderColor = '#cccc00';
        });
    },
};
