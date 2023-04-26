import type { Migration } from './migration-functions';

export const activitiesToUnloadVehiclesBehavior28: Migration = {
    action: (intermediaryState, action) => {
        if (
            (action as { type: string }).type ===
            '[SimulatedRegion] Add Behavior'
        ) {
            const typedAction = action as {
                behaviorState: {
                    type: 'unloadArrivingVehiclesBehavior';
                    vehicleActivityMap: { [key: string]: string };
                };
            };
            if (
                typedAction.behaviorState.type ===
                'unloadArrivingVehiclesBehavior'
            ) {
                typedAction.behaviorState.vehicleActivityMap = {};
            }
        } else if (
            (action as { type: string }).type ===
            '[SimulatedRegion] Add simulated region'
        ) {
            const typedAction = action as {
                simulatedRegion: RelevantRegionProperties;
            };
            migrateSimulatedRegion(
                intermediaryState,
                typedAction.simulatedRegion,
                false
            );
        }
        return true;
    },
    state: (state) => {
        const typedState = state as {
            simulatedRegions: {
                [key: string]: RelevantRegionProperties;
            };
        };
        Object.values(typedState.simulatedRegions).forEach((region) => {
            migrateSimulatedRegion(typedState, region, true);
        });
    },
};

function migrateSimulatedRegion(
    state: object,
    region: RelevantRegionProperties,
    occupyVehicles: boolean
) {
    const typedState = state as {
        vehicles: {
            [key: string]: {
                position: {
                    type: 'simulatedRegion';
                    simulatedRegionId: string;
                };
                occupation: {
                    type: `${string}Occupation`;
                };
            };
        };
    };
    const unloadBehaviors = Object.values(region.behaviors).filter(
        (behavior) => behavior.type === 'unloadArrivingVehiclesBehavior'
    );
    unloadBehaviors.forEach((behavior) => {
        behavior.vehicleActivityMap = {};
    });
    const designatedBehavior = unloadBehaviors[0];
    if (!designatedBehavior) {
        return;
    }
    Object.values(region.activities)
        .filter((activity) => activity.type === 'unloadVehicleActivity')
        .forEach(({ id: activityId, vehicleId }) => {
            const vehicle = typedState.vehicles[vehicleId];
            if (!vehicle) {
                return;
            }
            designatedBehavior.vehicleActivityMap[vehicleId] = activityId;
            if (occupyVehicles) {
                vehicle.occupation = {
                    type: 'unloadingOccupation',
                };
            }
        });
}

interface RelevantRegionProperties {
    id: string;
    activities: {
        [key: string]: {
            type: 'unloadVehicleActivity';
            id: string;
            vehicleId: string;
        };
    };
    behaviors: {
        type: 'unloadArrivingVehiclesBehavior';
        vehicleActivityMap: { [key: string]: string };
    }[];
}
