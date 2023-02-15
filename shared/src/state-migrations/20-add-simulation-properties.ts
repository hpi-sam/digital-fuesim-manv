import { seededRandomState } from '../simulation';
import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

export const addSimulationProperties20: Migration = {
    actions: null,
    state: (state: any) => {
        state.randomState = seededRandomState();

        const typedState = state as {
            simulatedRegions: {
                [simulatedRegionId: UUID]: {
                    inEvents: any[];
                    behaviors: any[];
                    activities: object;
                };
            };
        };

        Object.values(typedState.simulatedRegions).forEach(
            (simulatedRegion) => {
                simulatedRegion.inEvents = [];
                simulatedRegion.behaviors = [];
                simulatedRegion.activities = {};
            }
        );
    },
};
