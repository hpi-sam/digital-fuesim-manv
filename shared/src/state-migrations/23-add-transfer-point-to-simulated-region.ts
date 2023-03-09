import { uuid } from '../utils';
import type { Migration } from './migration-functions';

export const addTransferPointToSimulatedRegion23: Migration = {
    action: (intermediaryState, action) => {
        const actionType = (action as { type: string } | null)?.type;
        if (actionType === '[SimulatedRegion] Add Simulated Region') {
            const typedAction = action as {
                simulatedRegion: { name: string; id: string };
                transferPoint?: {
                    id: string;

                    type: 'transferPoint';

                    position:
                        | {
                              type: 'simulatedRegion';
                              simulatedRegionId: string;
                          }
                        | { type: Exclude<'simulatedRegion', unknown> };

                    reachableTransferPoints: {
                        [connectTransferPointId: string]: {
                            duration: number;
                        };
                    };

                    reachableHospitals: { [key: string]: true };

                    internalName: string;

                    externalName: string;
                };
            };

            const transferPointId = uuid();
            typedAction.transferPoint = {
                id: transferPointId,

                type: 'transferPoint',

                position: {
                    type: 'simulatedRegion',
                    simulatedRegionId: typedAction.simulatedRegion.id,
                },

                reachableTransferPoints: {},

                reachableHospitals: {},

                internalName: '',

                externalName: `[Simuliert] ${typedAction.simulatedRegion.name}`,
            };
        }
        return true;
    },
    state: (state) => {
        const typedState = state as {
            simulatedRegions: {
                [simulatedRegionId: string]: { name: string };
            };

            transferPoints: {
                [transferPointId: string]: {
                    id: string;

                    type: 'transferPoint';

                    position:
                        | {
                              type: 'simulatedRegion';
                              simulatedRegionId: string;
                          }
                        | { type: Exclude<'simulatedRegion', unknown> };

                    reachableTransferPoints: {
                        [connectTransferPointId: string]: {
                            duration: number;
                        };
                    };

                    reachableHospitals: { [key: string]: true };

                    internalName: string;

                    externalName: string;
                };
            };
        };
        Object.keys(typedState.simulatedRegions).forEach(
            (simulatedRegionId) => {
                const transferPointId = uuid();
                typedState.transferPoints[transferPointId] = {
                    id: transferPointId,

                    type: 'transferPoint',

                    position: {
                        type: 'simulatedRegion',
                        simulatedRegionId,
                    },

                    reachableTransferPoints: {},

                    reachableHospitals: {},

                    internalName: '',

                    externalName: `[Simuliert] ${
                        typedState.simulatedRegions[simulatedRegionId]!.name
                    }`,
                };
            }
        );
    },
};
