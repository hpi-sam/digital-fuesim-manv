import type { Migration } from './migration-functions';

export const removeTransferVehiclesActivityAndChangeAnswerRequestBehavior29: Migration =
    {
        action: (_intermediaryState, action) => {
            if (
                (action as { type: string }).type ===
                '[SimulatedRegion] Add Behavior'
            ) {
                const typedAction = action as {
                    behaviorState:
                        | {
                              type: 'answerRequestsBehavior';
                              receivedEvents: unknown[] | undefined;
                              requestsHandled: number | undefined;
                          }
                        | {
                              type: Exclude<'answerRequestsBehavior', unknown>;
                          };
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
                    simulatedRegion: {
                        activities: {
                            [stateId: string]: {
                                type: string | 'transferVehiclesActivity';
                            };
                        };
                        behaviors: (
                            | {
                                  type: 'answerRequestsBehavior';
                                  receivedEvents: unknown[] | undefined;
                                  requestsHandled: number | undefined;
                              }
                            | {
                                  type: Exclude<
                                      'answerRequestsBehavior',
                                      unknown
                                  >;
                              }
                        )[];
                    };
                };
                Object.keys(typedAction.simulatedRegion.activities).forEach(
                    (key) => {
                        if (
                            typedAction.simulatedRegion.activities[key]!
                                .type === 'transferVehiclesActivity'
                        ) {
                            delete typedAction.simulatedRegion.activities[key];
                        }
                    }
                );

                typedAction.simulatedRegion.behaviors.forEach((behavior) => {
                    if (behavior.type === 'answerRequestsBehavior') {
                        behavior.receivedEvents = [];
                        behavior.requestsHandled = 0;
                    }
                });
            }
            return true;
        },
        state: (state) => {
            const typedState = state as {
                simulatedRegions: {
                    [key: string]: {
                        activities: {
                            [stateId: string]: {
                                type: string | 'transferVehiclesActivity';
                            };
                        };
                        behaviors: (
                            | {
                                  type: 'answerRequestsBehavior';
                                  receivedEvents: unknown[] | undefined;
                                  requestsHandled: number | undefined;
                              }
                            | {
                                  type: Exclude<
                                      'answerRequestsBehavior',
                                      unknown
                                  >;
                              }
                        )[];
                    };
                };
            };

            Object.values(typedState.simulatedRegions).forEach(
                (simulatedRegion) => {
                    Object.keys(simulatedRegion.activities).forEach((key) => {
                        if (
                            simulatedRegion.activities[key]!.type ===
                            'transferVehiclesActivity'
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
            );
        },
    };
