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
import {
    RequestBehaviorState,
    getResourcesToRequest,
    updateBehaviorsRequestInterval,
    updateBehaviorsRequestTarget,
} from './request';
import { cloneDeepMutable } from '../../utils/clone-deep';
import { Mutable } from '../../utils/immutability';
import { sendSimulationEvent } from '../events/utils';
import { handleSimulationEvents } from '../utils/simulation';
import { StrictObject, uuid } from '../../utils';
import { DelayEventActivityState } from '../activities';
import { addActivity } from '../activities/utils';
import { SendRequestEvent } from '../events/send-request';
import { CreateRequestActivityState } from '../activities/create-request';

const emptyState = ExerciseState.create('123456');
const currentTime = 12345;

function setupStateAndInteract(
    setBehaviorState: (
        state: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => void,
    addRequestsAndPromises: (
        state: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => void,
    interact: (
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
        setBehaviorState(draftState, mutableSimulatedRegion, behaviorState);
        addRequestsAndPromises(
            draftState,
            mutableSimulatedRegion,
            behaviorState
        );
    });

    const afterState = produce(beforeState, (draftState) => {
        const mutableSimulatedRegion =
            draftState.simulatedRegions[simulatedRegion.id]!;
        interact(
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

const requestKey = 'initial-request';

const setBehaviorState = {
    idle: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {},
    onTimer: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.delayEventActivityId = uuid();
        addActivity(
            simulatedRegion,
            DelayEventActivityState.create(
                behaviorState.delayEventActivityId,
                SendRequestEvent.create(),
                draftState.currentTime
            )
        );
    },
    waiting: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.answerKey = `${simulatedRegion.id}-request-${behaviorState.requestTargetVersion}`;
    },
};

function assertSameState(
    beforeBehaviorState: RequestBehaviorState,
    afterBehaviorState: RequestBehaviorState
) {
    expect(afterBehaviorState.delayEventActivityId).toEqual(
        beforeBehaviorState.delayEventActivityId
    );
    expect(afterBehaviorState.answerKey).toEqual(beforeBehaviorState.answerKey);
}

function assertIdleState(behaviorState: RequestBehaviorState) {
    expect(behaviorState.delayEventActivityId).toBeUndefined();
    expect(behaviorState.answerKey).toBeUndefined();
}

function assertTimerState(
    simulatedRegion: SimulatedRegion,
    behaviorState: RequestBehaviorState,
    nextTime: number
) {
    expect(behaviorState.answerKey).toBeUndefined();

    const activityId = behaviorState.delayEventActivityId;
    expect(activityId).toBeDefined();

    const activityState = simulatedRegion.activities[activityId!];
    expect(activityState).toBeDefined();

    const activityType = activityState!.type;
    expect(activityType).toBe('delayEventActivity');

    const typedActivityState = activityState as DelayEventActivityState;
    expect(typedActivityState.endTime).toBe(nextTime);
}

function assertWaitingState(behaviorState: RequestBehaviorState) {
    expect(behaviorState.delayEventActivityId).toBeUndefined();
    expect(behaviorState.answerKey).toBeDefined();
}

const withoutKTWPromise: (keyof typeof addRequestsAndPromises)[] = [
    'withoutRequestsAndPromises',
    'withRequests',
    'withPromiseOfOtherType',
];
const withOneKTWPromised: (keyof typeof addRequestsAndPromises)[] = [
    'withPromises',
    'withOldPromises',
    'withRequestsAndEnoughPromises',
    'withRequestsAndNotEnoughPromises',
    'withPromisesOfMultipleTypes',
];

const withOneKTWRequired: (keyof typeof addRequestsAndPromises)[] = [
    'withRequests',
    'withRequestsAndNotEnoughPromises',
];
const withoutVehiclesRequired: (keyof typeof addRequestsAndPromises)[] = [
    'withoutRequestsAndPromises',
    'withPromises',
    'withRequestsAndEnoughPromises',
    'withPromiseOfOtherType',
    'withPromisesOfMultipleTypes',
];

const oldTime = currentTime - 100;
const withoutOldTime: (keyof typeof addRequestsAndPromises)[] = [
    'withoutRequestsAndPromises',
    'withRequests',
    'withPromises',
    'withRequestsAndEnoughPromises',
    'withRequestsAndNotEnoughPromises',
    'withPromiseOfOtherType',
    'withPromisesOfMultipleTypes',
];

const withOldTime: (keyof typeof addRequestsAndPromises)[] = [
    'withOldPromises',
    'withOldAndNewPromises',
];

const addRequestsAndPromises = {
    withoutRequestsAndPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {},
    withRequests: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.requestedResources[requestKey] = VehicleResource.create({
            KTW: 1,
        });
    },
    withPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.promisedResources = [
            {
                promisedTime: draftState.currentTime,
                resource: VehicleResource.create({ KTW: 1 }),
            },
        ];
    },
    withOldPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.promisedResources = [
            {
                promisedTime: oldTime,
                resource: VehicleResource.create({ KTW: 1 }),
            },
        ];
    },
    withOldAndNewPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.promisedResources = [
            {
                promisedTime: oldTime,
                resource: VehicleResource.create({ KTW: 1 }),
            },
            {
                promisedTime: draftState.currentTime,
                resource: VehicleResource.create({ KTW: 1 }),
            },
        ];
    },
    withRequestsAndEnoughPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.requestedResources[requestKey] = VehicleResource.create({
            KTW: 1,
        });
        behaviorState.promisedResources = [
            {
                promisedTime: draftState.currentTime,
                resource: VehicleResource.create({ KTW: 1 }),
            },
        ];
    },
    withRequestsAndNotEnoughPromises: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.requestedResources[requestKey] = VehicleResource.create({
            KTW: 2,
        });
        behaviorState.promisedResources = [
            {
                promisedTime: draftState.currentTime,
                resource: VehicleResource.create({ KTW: 1 }),
            },
        ];
    },
    withPromiseOfOtherType: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.promisedResources = [
            {
                promisedTime: draftState.currentTime,
                resource: VehicleResource.create({ RTW: 1 }),
            },
        ];
    },
    withPromisesOfMultipleTypes: (
        draftState: Mutable<ExerciseState>,
        simulatedRegion: Mutable<SimulatedRegion>,
        behaviorState: Mutable<RequestBehaviorState>
    ) => {
        behaviorState.promisedResources = [
            {
                promisedTime: draftState.currentTime,
                resource: VehicleResource.create({ KTW: 1 }),
            },
            {
                promisedTime: draftState.currentTime,
                resource: VehicleResource.create({ RTW: 1 }),
            },
        ];
    },
};

const vehicleSendEvents: (keyof typeof sendEvent)[] = [
    'vehiclesSendEventForAnswerKey',
    'vehiclesSendEventForOtherKey',
];

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
        draftState.vehicles[vehicle.id] = vehicle;

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

const newRequestInterval = 1000;
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
    draftState.transferPoints[transferPoint.id] = transferPoint;
    draftState.simulatedRegions[otherSimulatedRegion.id] = otherSimulatedRegion;
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
    behaviorState.invalidatePromiseInterval = 1;
    // update its promised resources
    getResourcesToRequest(draftState, simulatedRegion, behaviorState);
};

const newInvalidationInterval = 1000;

describe('request behavior', () => {
    describe.each(StrictObject.keys(addRequestsAndPromises))(
        '%s',
        (requestsAndPromises) => {
            describe.each(StrictObject.keys(setBehaviorState))(
                'in %s state',
                (state) => {
                    describe('on a resource required event', () => {
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

                        if (state === 'idle') {
                            it('should move to the onTimer state', () => {
                                const {
                                    afterSimulatedRegion,
                                    afterBehaviorState,
                                } = setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    sendEvent.resourceRequiredEvent
                                );

                                assertTimerState(
                                    afterSimulatedRegion,
                                    afterBehaviorState,
                                    currentTime
                                );
                            });
                        } else {
                            it('should not change its state', () => {
                                const {
                                    beforeBehaviorState,
                                    afterBehaviorState,
                                } = setupStateAndInteract(
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
                    });

                    describe('on a resource required event with a known key', () => {
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
                    });

                    describe.each(
                        StrictObject.keys(sendEvent).filter((type) =>
                            vehicleSendEvents.includes(type)
                        )
                    )('on a %s', (event) => {
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

                        if (
                            state === 'waiting' &&
                            event === 'vehiclesSendEventForAnswerKey'
                        ) {
                            it('should move to the onTimer state', () => {
                                const {
                                    afterSimulatedRegion,
                                    afterBehaviorState,
                                } = setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    sendEvent[event]
                                );

                                assertTimerState(
                                    afterSimulatedRegion,
                                    afterBehaviorState,
                                    currentTime +
                                        afterBehaviorState.requestInterval
                                );
                            });
                        } else {
                            it('should not change its state', () => {
                                const {
                                    beforeBehaviorState,
                                    afterBehaviorState,
                                } = setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    sendEvent[event]
                                );

                                assertSameState(
                                    beforeBehaviorState,
                                    afterBehaviorState
                                );
                            });
                        }
                    });

                    describe('on a ktw vehicle arrived event', () => {
                        if (withoutKTWPromise.includes(requestsAndPromises)) {
                            it('should not change its noted promises', () => {
                                const {
                                    beforeBehaviorState,
                                    afterBehaviorState,
                                } = setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    sendEvent.ktwVehicleArrivedEvent
                                );

                                expect(
                                    afterBehaviorState.promisedResources
                                ).toEqual(
                                    beforeBehaviorState.promisedResources
                                );
                            });
                        }
                        if (withOneKTWPromised.includes(requestsAndPromises)) {
                            it('should remove the promise', () => {
                                const { afterBehaviorState } =
                                    setupStateAndInteract(
                                        setBehaviorState[state],
                                        addRequestsAndPromises[
                                            requestsAndPromises
                                        ],
                                        sendEvent.ktwVehicleArrivedEvent
                                    );

                                expect(
                                    afterBehaviorState.promisedResources.find(
                                        (promise) =>
                                            'KTW' in
                                            promise.resource.vehicleCounts
                                    )
                                ).toBeUndefined();
                            });
                        }
                    });

                    describe('on a send request event', () => {
                        // other states should not be possible
                        if (state === 'onTimer') {
                            if (
                                withOneKTWRequired.includes(requestsAndPromises)
                            ) {
                                it('should move to the waiting state', () => {
                                    const { afterBehaviorState } =
                                        setupStateAndInteract(
                                            setBehaviorState[state],
                                            addRequestsAndPromises[
                                                requestsAndPromises
                                            ],
                                            sendEvent.sendRequestEvent
                                        );

                                    assertWaitingState(afterBehaviorState);
                                });

                                it('should create a request via an activity', () => {
                                    const {
                                        afterSimulatedRegion,
                                        afterBehaviorState,
                                    } = setupStateAndInteract(
                                        setBehaviorState[state],
                                        addRequestsAndPromises[
                                            requestsAndPromises
                                        ],
                                        sendEvent.sendRequestEvent
                                    );

                                    const activities =
                                        afterSimulatedRegion.activities;
                                    expect(
                                        Object.keys(activities).length
                                    ).toBeGreaterThanOrEqual(1);

                                    const activity = Object.values(
                                        activities
                                    ).find(
                                        (a) =>
                                            a.type === 'createRequestActivity'
                                    );
                                    expect(activity).toBeDefined();

                                    const typedActivity =
                                        activity as CreateRequestActivityState;
                                    expect(
                                        typedActivity.targetConfiguration
                                    ).toEqual(afterBehaviorState.requestTarget);
                                    expect(
                                        typedActivity.requestedResource
                                    ).toEqual(
                                        VehicleResource.create({ KTW: 1 })
                                    );
                                    expect(typedActivity.key).toEqual(
                                        afterBehaviorState.answerKey
                                    );
                                });
                            }
                            if (
                                withoutVehiclesRequired.includes(
                                    requestsAndPromises
                                )
                            ) {
                                it('should move to the idle state', () => {
                                    const { afterBehaviorState } =
                                        setupStateAndInteract(
                                            setBehaviorState[state],
                                            addRequestsAndPromises[
                                                requestsAndPromises
                                            ],
                                            sendEvent.sendRequestEvent
                                        );

                                    assertIdleState(afterBehaviorState);
                                });
                            }
                        }
                    });

                    describe('when the request interval is updated', () => {
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

                        if (state === 'onTimer') {
                            it('should update the timer', () => {
                                const {
                                    beforeBehaviorState,
                                    beforeSimulatedRegion,
                                    afterSimulatedRegion,
                                } = setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    updateRequestInterval
                                );

                                const beforeDelayEventActivity = Object.values(
                                    beforeSimulatedRegion.activities
                                ).find(
                                    (a) => a.type === 'delayEventActivity'
                                ) as Mutable<DelayEventActivityState>;
                                const afterDelayEventActivity = Object.values(
                                    afterSimulatedRegion.activities
                                ).find(
                                    (a) => a.type === 'delayEventActivity'
                                ) as Mutable<DelayEventActivityState>;

                                expect(
                                    afterDelayEventActivity.endTime -
                                        beforeDelayEventActivity.endTime
                                ).toBe(
                                    newRequestInterval -
                                        beforeBehaviorState.requestInterval
                                );
                            });
                        }
                    });

                    describe('when the request target is updated', () => {
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

                        it('should switch to the onTimer state', () => {
                            const { afterSimulatedRegion, afterBehaviorState } =
                                setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    updateRequestTarget
                                );

                            assertTimerState(
                                afterSimulatedRegion,
                                afterBehaviorState,
                                currentTime
                            );
                        });

                        it('should have deleted any other timer activities', () => {
                            const { afterSimulatedRegion } =
                                setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    updateRequestTarget
                                );

                            const activities = afterSimulatedRegion.activities;
                            expect(Object.keys(activities).length).toBe(1);
                        });
                    });

                    describe('when the invalidation interval for promises is updated', () => {
                        if (withoutOldTime.includes(requestsAndPromises)) {
                            it('should not invalidate any promises', () => {
                                const {
                                    beforeBehaviorState,
                                    afterBehaviorState,
                                } = setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    updateInvalidationInterval
                                );

                                expect(
                                    afterBehaviorState.promisedResources
                                ).toEqual(
                                    beforeBehaviorState.promisedResources
                                );
                            });
                        }
                        if (withOldTime.includes(requestsAndPromises)) {
                            it('should invalidate old promises', () => {
                                const {
                                    beforeBehaviorState,
                                    afterBehaviorState,
                                } = setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    updateInvalidationInterval
                                );

                                expect(
                                    Object.keys(
                                        afterBehaviorState.promisedResources.filter(
                                            (promise) =>
                                                promise.promisedTime <
                                                currentTime
                                        )
                                    ).length
                                ).toBe(0);
                            });

                            it('should keep current promises', () => {
                                const {
                                    beforeBehaviorState,
                                    afterBehaviorState,
                                } = setupStateAndInteract(
                                    setBehaviorState[state],
                                    addRequestsAndPromises[requestsAndPromises],
                                    updateInvalidationInterval
                                );

                                beforeBehaviorState.promisedResources.forEach(
                                    (beforePromise) => {
                                        if (
                                            beforePromise.promisedTime >=
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
                    });
                }
            );
        }
    );
});
