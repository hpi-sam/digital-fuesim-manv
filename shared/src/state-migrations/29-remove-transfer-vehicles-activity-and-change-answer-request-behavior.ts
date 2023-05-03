import type { Migration } from './migration-functions';

export const removeTransferVehiclesActivityAndChangeAnswerRequestBehavior29: Migration =
    {
        action: null,
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
