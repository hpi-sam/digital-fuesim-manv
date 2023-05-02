import type { Migration } from './migration-functions';

export const removeTransferVehiclesActivity29: Migration = {
    action: null,
    state: (state) => {
        const typedState = state as {
            simulatedRegions: {
                [key: string]: {
                    activities: {
                        [stateId: string]: {
                            type: string | 'transferVehicles';
                        };
                    };
                };
            };
        };

        Object.values(typedState.simulatedRegions).forEach(
            (simulatedRegion) => {
                Object.keys(simulatedRegion.activities).forEach((key) => {
                    if (
                        simulatedRegion.activities[key]!.type ===
                        'transferVehicles'
                    ) {
                        delete simulatedRegion.activities[key];
                    }
                });
            }
        );
    },
};
