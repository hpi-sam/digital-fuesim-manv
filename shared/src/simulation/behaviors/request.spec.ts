import produce from 'immer';
import {
    ImageProperties,
    MapCoordinates,
    SimulatedRegion,
    SimulatedRegionPosition,
    SimulatedRegionRequestTargetConfiguration,
    Size,
    TransferPoint,
    Vehicle,
    VehicleResource,
} from '../../models';
import { ExerciseState } from '../../state';
import {
    ResourceRequiredEvent,
    VehicleArrivedEvent,
    VehiclesSentEvent,
} from '../events';
import { cloneDeepMutable } from '../../utils/clone-deep';
import type { Mutable } from '../../utils/immutability';
import { sendSimulationEvent } from '../events/utils';
import { handleSimulationEvents } from '../utils/simulation';
import { StrictObject, uuid } from '../../utils';
import { RecurringEventActivityState } from '../activities';
import { addActivity } from '../activities/utils';
import { SendRequestEvent } from '../events/send-request';
import type { CreateRequestActivityState } from '../activities/create-request';
import { ResourcePromise } from '../utils/resource-promise';
import {
    RequestBehaviorState,
    getResourcesToRequest,
    isWaitingForAnswer,
    updateBehaviorsRequestInterval,
    updateBehaviorsRequestTarget,
} from './request';

// constants
const emptyState = ExerciseState.create('123456');
const currentTime = 12345;
const requestKey = 'initial-request';
const oldTime = currentTime - 100;
const newRequestInterval = 1000;
const newInvalidationInterval = 1;

// partial states
const withoutKTWPromise = [
    'withoutRequestsAndPromises',
    'withRequests',
    'withPromiseOfOtherType',
] as const;
const withOneKTWPromised = [
    'withPromises',
    'withOldPromises',
    'withRequestsAndEnoughPromises',
    'withRequestsAndNotEnoughPromises',
    'withPromisesOfMultipleTypes',
] as const;

const withOneKTWRequired = [
    'withRequests',
    'withRequestsAndNotEnoughPromises',
] as const;
const withoutVehiclesRequired = [
    'withoutRequestsAndPromises',
    'withPromises',
    'withRequestsAndEnoughPromises',
    'withPromiseOfOtherType',
    'withPromisesOfMultipleTypes',
] as const;
const withoutOldTime = [
    'withoutRequestsAndPromises',
    'withRequests',
    'withPromises',
    'withRequestsAndEnoughPromises',
    'withRequestsAndNotEnoughPromises',
    'withPromiseOfOtherType',
    'withPromisesOfMultipleTypes',
] as const;

const withOldTime = ['withOldPromises', 'withOldAndNewPromises'] as const;

const vehicleSendEvents = [
    'vehiclesSendEventForAnswerKey',
    'vehiclesSendEventForOtherKey',
] as const;

// helper functions
function setupStateAndInteract(
    initializeBehaviorState: (
        state: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => void,
    initializeRequestsAndPromises: (
        state: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => void,
    interaction: (
        state: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => void
) {
    const simulatedRegion = SimulatedRegion.create(
        MapCoordinates.create(0, 0),
        Size.create(10, 10),
        'test region'
    );
    const transferPoint = TransferPoint.create(
        SimulatedRegionPosition.create(simulatedRegion.id),
        {},
        {},
        '',
        `[Simuliert] test region`
    );

    const beforeState = produce(emptyState, (draftState) => {
        draftState.simulatedRegions[simulatedRegion.id] =
            cloneDeepMutable(simulatedRegion);
        draftState.simulatedRegions[simulatedRegion.id]?.behaviors.push(
            cloneDeepMutable(RequestBehaviorState.create())
        );
        draftState.transferPoints[transferPoint.id] =
            cloneDeepMutable(transferPoint);

        draftState.currentTime = currentTime;

        const mutableSimulatedRegion =
            draftState.simulatedRegions[simulatedRegion.id]!;
        const behaviorState = mutableSimulatedRegion
            .behaviors[0] as Mutable<RequestBehaviorState>;
        initializeBehaviorState(
            draftState,
            mutableSimulatedRegion,
            behaviorState
        );
        initializeRequestsAndPromises(
            draftState,
            mutableSimulatedRegion,
            behaviorState
        );
    });

    const afterState = produce(beforeState, (draftState) => {
        const mutableSimulatedRegion =
            draftState.simulatedRegions[simulatedRegion.id]!;
        interaction(
            draftState,
            mutableSimulatedRegion,
            mutableSimulatedRegion.behaviors[0] as Mutable<RequestBehaviorState>
        );
        handleSimulationEvents(draftState, mutableSimulatedRegion);
    });

    const beforeSimulatedRegion =
        beforeState.simulatedRegions[simulatedRegion.id]!;
    const afterSimulatedRegion =
        afterState.simulatedRegions[simulatedRegion.id]!;
    const beforeBehaviorState = beforeSimulatedRegion
        .behaviors[0] as RequestBehaviorState;
    const afterBehaviorState = afterSimulatedRegion
        .behaviors[0] as RequestBehaviorState;
    return {
        beforeState,
        afterState,
        beforeSimulatedRegion,
        afterSimulatedRegion,
        beforeBehaviorState,
        afterBehaviorState,
    };
}

const updateRequestInterval = (
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<RequestBehaviorState>
) => {
    updateBehaviorsRequestInterval(
        draftState,
        simulatedRegion,
        behaviorState,
        newRequestInterval
    );
};

const updateRequestTarget = (
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<RequestBehaviorState>
) => {
    const otherSimulatedRegion = cloneDeepMutable(
        SimulatedRegion.create(
            MapCoordinates.create(0, 0),
            Size.create(10, 10),
            'requestable region'
        )
    );
    const transferPoint = TransferPoint.create(
        SimulatedRegionPosition.create(otherSimulatedRegion.id),
        {},
        {},
        '',
        `[Simuliert] requestable region`
    );
    draftState.transferPoints[transferPoint.id] =
        cloneDeepMutable(transferPoint);
    draftState.simulatedRegions[otherSimulatedRegion.id] =
        cloneDeepMutable(otherSimulatedRegion);
    updateBehaviorsRequestTarget(
        draftState,
        simulatedRegion,
        behaviorState,
        SimulatedRegionRequestTargetConfiguration.create(
            otherSimulatedRegion.id
        )
    );
};

const updateInvalidationInterval = (
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<RequestBehaviorState>
) => {
    behaviorState.invalidatePromiseInterval = newInvalidationInterval;
    // update its promised resources
    getResourcesToRequest(draftState, simulatedRegion, behaviorState);
};

// factories
const setBehaviorState = {
    onTimer: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.recurringEventActivityId = uuid();
        addActivity(
            simulatedRegion,
            RecurringEventActivityState.create(
                behaviorState.recurringEventActivityId,
                SendRequestEvent.create(),
                draftState.currentTime,
                behaviorState.requestInterval
            )
        );
    },
    waiting: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.recurringEventActivityId = uuid();
        addActivity(
            simulatedRegion,
            RecurringEventActivityState.create(
                behaviorState.recurringEventActivityId,
                SendRequestEvent.create(),
                draftState.currentTime,
                behaviorState.requestInterval
            )
        );
        behaviorState.answerKey = `${simulatedRegion.id}-request-${behaviorState.requestTargetVersion}`;
    },
};

const addRequestsAndPromises = {
    withoutRequestsAndPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) => {},
    withRequests: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.requestedResources[requestKey] = cloneDeepMutable(
            VehicleResource.create({
                KTW: 1,
            })
        );
    },
    withPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.promisedResources = cloneDeepMutable([
            ResourcePromise.create(
                draftState.currentTime,
                VehicleResource.create({ KTW: 1 })
            ),
        ]);
    },
    withOldPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.promisedResources = cloneDeepMutable([
            ResourcePromise.create(oldTime, VehicleResource.create({ KTW: 1 })),
        ]);
    },
    withOldAndNewPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.promisedResources = cloneDeepMutable([
            ResourcePromise.create(oldTime, VehicleResource.create({ KTW: 1 })),
            ResourcePromise.create(
                draftState.currentTime,
                VehicleResource.create({ KTW: 1 })
            ),
        ]);
    },
    withRequestsAndEnoughPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.requestedResources[requestKey] = cloneDeepMutable(
            VehicleResource.create({
                KTW: 1,
            })
        );
        behaviorState.promisedResources = cloneDeepMutable([
            ResourcePromise.create(
                draftState.currentTime,
                VehicleResource.create({ KTW: 1 })
            ),
        ]);
    },
    withRequestsAndNotEnoughPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.requestedResources[requestKey] = cloneDeepMutable(
            VehicleResource.create({
                KTW: 2,
            })
        );
        behaviorState.promisedResources = cloneDeepMutable([
            ResourcePromise.create(
                draftState.currentTime,
                VehicleResource.create({ KTW: 1 })
            ),
        ]);
    },
    withPromiseOfOtherType: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.promisedResources = cloneDeepMutable([
            ResourcePromise.create(
                draftState.currentTime,
                VehicleResource.create({ RTW: 1 })
            ),
        ]);
    },
    withPromisesOfMultipleTypes: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.promisedResources = cloneDeepMutable([
            ResourcePromise.create(
                draftState.currentTime,
                VehicleResource.create({ KTW: 1 })
            ),
            ResourcePromise.create(
                draftState.currentTime,
                VehicleResource.create({ RTW: 1 })
            ),
        ]);
    },
};

const sendEvent = {
    resourceRequiredEvent: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        sendSimulationEvent(
            simulatedRegion,
            ResourceRequiredEvent.create(
                uuid(),
                simulatedRegion.id,
                VehicleResource.create({ KTW: 1 }),
                'new-request-key'
            )
        );
    },
    resourceRequiredEventWithKnownKey: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        sendSimulationEvent(
            simulatedRegion,
            ResourceRequiredEvent.create(
                uuid(),
                simulatedRegion.id,
                VehicleResource.create({ KTW: 1 }),
                requestKey
            )
        );
    },
    vehiclesSendEventForAnswerKey: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        sendSimulationEvent(
            simulatedRegion,
            VehiclesSentEvent.create(
                uuid(),
                VehicleResource.create({ KTW: 1 }),
                `${simulatedRegion.id}-request-${behaviorState.requestTargetVersion}`
            )
        );
    },
    vehiclesSendEventForOtherKey: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        sendSimulationEvent(
            simulatedRegion,
            VehiclesSentEvent.create(
                uuid(),
                VehicleResource.create({ KTW: 1 }),
                'other-key'
            )
        );
    },
    ktwVehicleArrivedEvent: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        const vehicle = Vehicle.create(
            'KTW',
            'KTW 1',
            {},
            0,
            ImageProperties.create('', 0, 0),
            SimulatedRegionPosition.create(simulatedRegion.id)
        );
        draftState.vehicles[vehicle.id] = cloneDeepMutable(vehicle);

        sendSimulationEvent(
            simulatedRegion,
            VehicleArrivedEvent.create(vehicle.id, draftState.currentTime)
        );
    },
    sendRequestEvent: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        sendSimulationEvent(simulatedRegion, SendRequestEvent.create());
    },
};

// assertion helpers
function assertSameState(
    beforeBehaviorState: RequestBehaviorState,
    afterBehaviorState: RequestBehaviorState
) {
    expect(afterBehaviorState.answerKey).toEqual(beforeBehaviorState.answerKey);
}

function assertWaitingState(behaviorState: RequestBehaviorState) {
    expect(isWaitingForAnswer(behaviorState)).toBe(true);
}
function assertNotWaitingState(behaviorState: RequestBehaviorState) {
    expect(isWaitingForAnswer(behaviorState)).toBe(false);
}

// tests
describe('request behavior', () => {
    describe('on a resource required event', () => {
        describe.each(StrictObject.keys(addRequestsAndPromises))(
            '%s',
            (requestsAndPromises) => {
                describe.each(StrictObject.keys(setBehaviorState))(
                    'in %s state',
                    (state) => {
                        it('should note the request', () => {
                            const { afterBehaviorState } =
                                setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    sendEvent.resourceRequiredEvent
                                );

                            expect(
                                afterBehaviorState.requestedResources[
                                    'new-request-key'
                                ]
                            ).toEqual(VehicleResource.create({ KTW: 1 }));
                        });

                        it('should not change its state', () => {
                            const { beforeBehaviorState, afterBehaviorState } =
                                setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    sendEvent.resourceRequiredEvent
                                );

                            assertSameState(
                                beforeBehaviorState,
                                afterBehaviorState
                            );
                        });
                    }
                );
            }
        );
    });

    describe('on a resource required event with a known key', () => {
        describe.each(StrictObject.keys(addRequestsAndPromises))(
            '%s',
            (requestsAndPromises) => {
                describe.each(StrictObject.keys(setBehaviorState))(
                    'in %s state',
                    (state) => {
                        it('should overwrite any existing requests', () => {
                            const { afterBehaviorState } =
                                setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    sendEvent.resourceRequiredEventWithKnownKey
                                );

                            expect(
                                Object.keys(
                                    afterBehaviorState.requestedResources
                                ).length
                            ).toBe(1);
                        });
                    }
                );
            }
        );
    });

    describe.each(vehicleSendEvents)('on a %s', (event) => {
        describe.each(StrictObject.keys(addRequestsAndPromises))(
            '%s',
            (requestsAndPromises) => {
                describe.each(StrictObject.keys(setBehaviorState))(
                    'in %s state',
                    (state) => {
                        it('should note the promise', () => {
                            const { afterBehaviorState } =
                                setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    sendEvent[event]
                                );

                            const promisedResources =
                                afterBehaviorState.promisedResources;
                            expect(
                                promisedResources.length
                            ).toBeGreaterThanOrEqual(1);
                            const promise = promisedResources.at(-1)!;
                            expect(promise.resource).toEqual(
                                VehicleResource.create({ KTW: 1 })
                            );
                        });
                    }
                );

                it('should not start waiting for an answer', () => {
                    const { afterBehaviorState } = setupStateAndInteract(
                        setBehaviorState.onTimer,
                        addRequestsAndPromises[requestsAndPromises],
                        sendEvent[event]
                    );

                    assertNotWaitingState(afterBehaviorState);
                });
            }
        );
    });

    describe('on a vehiclesSendEventForAnswerKey', () => {
        describe.each(StrictObject.keys(addRequestsAndPromises))(
            '%s',
            (requestsAndPromises) => {
                describe('in waiting state', () => {
                    it('should not continue waiting for an answer', () => {
                        const { afterBehaviorState } = setupStateAndInteract(
                            setBehaviorState.waiting,
                            addRequestsAndPromises[requestsAndPromises],
                            sendEvent.vehiclesSendEventForAnswerKey
                        );

                        assertNotWaitingState(afterBehaviorState);
                    });
                });
            }
        );
    });

    describe('on a vehiclesSendEventForOtherKey', () => {
        describe.each(StrictObject.keys(addRequestsAndPromises))(
            '%s',
            (requestsAndPromises) => {
                describe('in waiting state', () => {
                    it('should continue waiting for an answer', () => {
                        const { afterBehaviorState } = setupStateAndInteract(
                            setBehaviorState.waiting,
                            addRequestsAndPromises[requestsAndPromises],
                            sendEvent.vehiclesSendEventForOtherKey
                        );

                        assertWaitingState(afterBehaviorState);
                    });
                });
            }
        );
    });

    describe('on a ktw vehicle arrived event', () => {
        describe.each(withoutKTWPromise)('%s', (requestsAndPromises) => {
            describe.each(StrictObject.keys(setBehaviorState))(
                'in %s state',
                (state) => {
                    it('should not change its noted promises', () => {
                        const { beforeBehaviorState, afterBehaviorState } =
                            setupStateAndInteract(
                                setBehaviorState[state],
                                addRequestsAndPromises[requestsAndPromises],
                                sendEvent.ktwVehicleArrivedEvent
                            );

                        expect(afterBehaviorState.promisedResources).toEqual(
                            beforeBehaviorState.promisedResources
                        );
                    });
                }
            );
        });

        describe.each(withOneKTWPromised)('%s', (requestsAndPromises) => {
            describe.each(StrictObject.keys(setBehaviorState))(
                'in %s state',
                (state) => {
                    it('should remove the promise', () => {
                        const { afterBehaviorState } = setupStateAndInteract(
                            setBehaviorState[state],
                            addRequestsAndPromises[requestsAndPromises],
                            sendEvent.ktwVehicleArrivedEvent
                        );

                        expect(
                            afterBehaviorState.promisedResources.find(
                                (promise) =>
                                    'KTW' in promise.resource.vehicleCounts
                            )
                        ).toBeUndefined();
                    });
                }
            );
        });
    });

    describe('on a send request event', () => {
        describe.each(withOneKTWRequired)('%s', (requestsAndPromises) => {
            describe('in onTimer State', () => {
                it('should move to the waiting state', () => {
                    const { afterBehaviorState } = setupStateAndInteract(
                        setBehaviorState.onTimer,
                        addRequestsAndPromises[requestsAndPromises],
                        sendEvent.sendRequestEvent
                    );

                    assertWaitingState(afterBehaviorState);
                });

                it('should create a request via an activity', () => {
                    const { afterSimulatedRegion, afterBehaviorState } =
                        setupStateAndInteract(
                            setBehaviorState.onTimer,
                            addRequestsAndPromises[requestsAndPromises],
                            sendEvent.sendRequestEvent
                        );

                    const activities = afterSimulatedRegion.activities;
                    expect(
                        StrictObject.keys(activities).length
                    ).toBeGreaterThanOrEqual(1);

                    const activity = StrictObject.values(activities).find(
                        (a) => a.type === 'createRequestActivity'
                    );
                    expect(activity).toBeDefined();

                    const typedActivity =
                        activity as CreateRequestActivityState;
                    expect(typedActivity.targetConfiguration).toEqual(
                        afterBehaviorState.requestTarget
                    );
                    expect(typedActivity.requestedResource).toEqual(
                        VehicleResource.create({ KTW: 1 })
                    );
                    expect(typedActivity.key).toEqual(
                        afterBehaviorState.answerKey
                    );
                });
            });
        });

        describe.each(withoutVehiclesRequired)('%s', (requestsAndPromises) => {
            describe('in onTimer state', () => {
                it('should stay in the onTimer state', () => {
                    const { afterBehaviorState } = setupStateAndInteract(
                        setBehaviorState.onTimer,
                        addRequestsAndPromises[requestsAndPromises],
                        sendEvent.sendRequestEvent
                    );

                    assertNotWaitingState(afterBehaviorState);
                });
            });
        });
    });

    describe('when the request interval is updated', () => {
        describe.each(StrictObject.keys(addRequestsAndPromises))(
            '%s',
            (requestsAndPromises) => {
                describe.each(StrictObject.keys(setBehaviorState))(
                    'in %s state',
                    (state) => {
                        it('should update the request interval', () => {
                            const { afterBehaviorState } =
                                setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    updateRequestInterval
                                );

                            expect(afterBehaviorState.requestInterval).toBe(
                                newRequestInterval
                            );
                        });

                        it('should update the timer', () => {
                            const { afterSimulatedRegion } =
                                setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    updateRequestInterval
                                );

                            const afterRecurringEventActivity =
                                StrictObject.values(
                                    afterSimulatedRegion.activities
                                ).find(
                                    (a) => a.type === 'recurringEventActivity'
                                ) as RecurringEventActivityState;

                            expect(
                                afterRecurringEventActivity.recurrenceIntervalTime
                            ).toBe(newRequestInterval);
                        });
                    }
                );
            }
        );
    });

    describe('when the request target is updated', () => {
        describe.each(StrictObject.keys(addRequestsAndPromises))(
            '%s',
            (requestsAndPromises) => {
                describe.each(StrictObject.keys(setBehaviorState))(
                    'in %s state',
                    (state) => {
                        it('should update the request target', () => {
                            const { afterBehaviorState } =
                                setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    updateRequestTarget
                                );

                            expect(
                                afterBehaviorState.requestTarget.type
                            ).toEqual('simulatedRegionRequestTarget');
                        });
                    }
                );

                describe('in waiting state', () => {
                    it('should not continue waiting for an answer', () => {
                        const { afterBehaviorState } = setupStateAndInteract(
                            setBehaviorState.waiting,
                            addRequestsAndPromises[requestsAndPromises],
                            updateRequestTarget
                        );

                        assertNotWaitingState(afterBehaviorState);
                    });
                });
            }
        );
    });

    describe('when the invalidation interval for promises is updated', () => {
        describe.each(withoutOldTime)('%s', (requestsAndPromises) => {
            describe.each(StrictObject.keys(setBehaviorState))(
                'in %s state',
                (state) => {
                    it('should not invalidate any promises', () => {
                        const { beforeBehaviorState, afterBehaviorState } =
                            setupStateAndInteract(
                                setBehaviorState[state],
                                addRequestsAndPromises[requestsAndPromises],
                                updateInvalidationInterval
                            );

                        expect(afterBehaviorState.promisedResources).toEqual(
                            beforeBehaviorState.promisedResources
                        );
                    });
                }
            );
        });

        describe.each(withOldTime)('%s', (requestsAndPromises) => {
            describe.each(StrictObject.keys(setBehaviorState))(
                'in %s state',
                (state) => {
                    it('should invalidate old promises', () => {
                        const { afterState, afterBehaviorState } =
                            setupStateAndInteract(
                                setBehaviorState[state],
                                addRequestsAndPromises[requestsAndPromises],
                                updateInvalidationInterval
                            );

                        expect(
                            Object.keys(
                                afterBehaviorState.promisedResources.filter(
                                    (promise) =>
                                        promise.promisedTime +
                                            newInvalidationInterval <
                                        afterState.currentTime
                                )
                            ).length
                        ).toBe(0);
                    });

                    it('should keep current promises', () => {
                        const { beforeBehaviorState, afterBehaviorState } =
                            setupStateAndInteract(
                                setBehaviorState[state],
                                addRequestsAndPromises[requestsAndPromises],
                                updateInvalidationInterval
                            );

                        beforeBehaviorState.promisedResources.forEach(
                            (beforePromise) => {
                                if (
                                    beforePromise.promisedTime +
                                        newInvalidationInterval >=
                                    currentTime
                                ) {
                                    expect(
                                        afterBehaviorState.promisedResources
                                    ).toContainEqual(beforePromise);
                                }
                            }
                        );
                    });
                }
            );
        });
    });
});
