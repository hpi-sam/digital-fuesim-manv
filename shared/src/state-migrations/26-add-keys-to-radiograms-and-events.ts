import type { Migration } from './migration-functions';

export const addKeysToRadiogramsAndEvents26: Migration = {
    action: null,
    state: (state) => {
        const typedState = state as {
            radiograms: {
                [radiogramId: string]: {
                    type: string;
                    key?: string;
                };
            };
            simulatedRegions: {
                [simulatedRegionId: string]: {
                    inEvents: {
                        type: string;
                        key?: string;
                    }[];
                };
            };
        };

        Object.values(typedState.radiograms)
            .filter(
                (radiogram) => radiogram.type === 'resourceRequestRadiogram'
            )
            .forEach((radiogram) => {
                radiogram.key = '';
            });

        Object.values(typedState.simulatedRegions).forEach(
            (simulatedRegion) => {
                Object.values(simulatedRegion.inEvents)
                    .filter((event) => event.type === 'vehiclesSentEvent')
                    .forEach((event) => {
                        event.key = '';
                    });
            }
        );
    },
};
