import type { Migration } from './migration-functions';

export const removeTransferVehiclesActivityAndChangeAnswerRequestBehavior29: Migration =
    {
        action: (_intermediaryState, action) => {
            if (
                (action as { type: string }).type ===
                '[SimulatedRegion] Add Behavior'
            ) {
                const typedAction = action as {
                    behaviorState: BehaviorStateStub;
                };
                if (
                    typedAction.behaviorState.type === 'answerRequestsBehavior'
                ) {
                    typedAction.behaviorState.receivedEvents = [];
                    typedAction.behaviorState.requestsHandled = 0;
                }
            } else if (
                (action as { type: string }).type ===
                '[SimulatedRegion] Add simulated region'
            ) {
                const typedAction = action as {
                    simulatedRegion: SimulatedRegionStub;
                };
                migrateSimulatedRegion(typedAction.simulatedRegion);
            }
            return true;
        },
        state: (state) => {
            const typedState = state as {
                simulatedRegions: {
                    [key: string]: SimulatedRegionStub;
                };
            };

            Object.values(typedState.simulatedRegions).forEach(
                (simulatedRegion) => {
                    migrateSimulatedRegion(simulatedRegion);
                }
            );
        },
    };

interface SimulatedRegionStub {
    activities: {
        [stateId: string]: {
            type: string | 'transferVehiclesActivity';
        };
    };
    behaviors: BehaviorStateStub[];
}

type BehaviorStateStub =
    | {
          type: 'answerRequestsBehavior';
          receivedEvents: unknown[] | undefined;
          requestsHandled: number | undefined;
      }
    | {
          type: Exclude<'answerRequestsBehavior', unknown>;
      };

function migrateSimulatedRegion(simulatedRegion: SimulatedRegionStub) {
    Object.keys(simulatedRegion.activities).forEach((key) => {
        if (
            simulatedRegion.activities[key]!.type === 'transferVehiclesActivity'
        ) {
            delete simulatedRegion.activities[key];
        }
    });

    simulatedRegion.behaviors.forEach((behavior) => {
        if (behavior.type === 'answerRequestsBehavior') {
            behavior.receivedEvents = [];
            behavior.requestsHandled = 0;
        }
    });
}
