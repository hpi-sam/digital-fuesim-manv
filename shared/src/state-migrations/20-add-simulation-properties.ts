import { seededRandomState } from '../simulation/utils/randomness';
import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

export const addSimulationProperties20: Migration = {
    action: (_intermediaryState, action) => {
        if (
            (action as { type: string }).type ===
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
        return true;
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
