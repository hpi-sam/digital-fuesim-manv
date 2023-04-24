import type { Migration } from './migration-functions';

export const addOccupationToVehicles26: Migration = {
    action: (_intermediaryState, action) => {
        if ((action as { type: string }).type === '[Vehicle] Add vehicle') {
            const typedAction = action as {
                vehicle: {
                    occupation?: {
                        type: `${string}Occupation`;
                    };
                };
            };
            typedAction.vehicle.occupation = {
                type: 'noOccupation',
            };
        }
        return true;
    },
    state: (state) => {
        const typedState = state as {
            vehicles: {
                [key in string]: {
                    occupation?: {
                        type: `${string}Occupation`;
                    };
                };
            };
        };
        Object.values(typedState.vehicles).forEach((vehicle) => {
            vehicle.occupation = {
                type: 'noOccupation',
            };
        });
    },
};
