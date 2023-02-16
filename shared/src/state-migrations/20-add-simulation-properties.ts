import { seededRandomState } from '../simulation';
import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

export const addSimulationProperties20: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            if (
                (action as { type: string } | null)?.type ===
                '[SimulatedRegion] Add simulated region'
            ) {
                const typedAction = action as {
                    simulatedRegion: {
                        inEvents: any[];
                        behaviors: any[];
                        activities: object;
                    };
                };
                typedAction.simulatedRegion.inEvents = [];
                typedAction.simulatedRegion.behaviors = [];
                typedAction.simulatedRegion.activities = {};
            }
        });
    },
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
