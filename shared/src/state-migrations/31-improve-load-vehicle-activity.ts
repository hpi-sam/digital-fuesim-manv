import type { Migration } from './migration-functions.js';

interface SimulatedRegionStub {
    activities: { [key: string]: ActivityStateStub };
}

interface LoadVehicleActivityStateStub {
    type: 'loadVehicleActivity';
    loadTimePerPatient: number;
    personnelLoadTime: number;
}

type ActivityStateStub =
    | LoadVehicleActivityStateStub
    | {
          type: Exclude<'loadVehicleActivity', unknown>;
      };

export const improveLoadVehicleActivity31: Migration = {
    // Only the data model of an activity has been changed, so there are no actions that have to be migrated
    action: null,

    state: (state) => {
        const typedState = state as {
            simulatedRegions: {
                [key: string]: SimulatedRegionStub;
            };
        };

        Object.values(typedState.simulatedRegions).forEach(
            (simulatedRegion) => {
                Object.values(simulatedRegion.activities).forEach(
                    (activityState) => {
                        // Disabled due to incomplete typings in the migration
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        if (activityState.type === 'loadVehicleActivity') {
                            // The loadTimePerPatient and personnelLoadTime must be set for the validation to pass
                            // However, the activity will still use the old loadDelay if it is set
                            // Therefore, it is okay to set the new variables to 0
                            activityState.loadTimePerPatient = 0;
                            activityState.personnelLoadTime = 0;
                        }
                    }
                );
            }
        );
    },
};
