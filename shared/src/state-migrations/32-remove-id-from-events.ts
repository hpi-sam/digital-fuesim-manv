import type { Migration } from './migration-functions';

interface SimulatedRegionStub {
    activities: { [key: string]: ActivityStateStub };
    inEvents: EventStub[];
}

type ActivityStateStub =
    | DelayEventActivityStub
    | GenerateReportActivityStub
    | RecurringEventActivityStub
    | SendRemoteEventActivityStub
    | {
          type: Exclude<
              | 'delayEventActivity'
              | 'generateReportActivity'
              | 'recurringEventActivity'
              | 'sendRemoteEventActivity',
              unknown
          >;
      };

interface GenerateReportActivityStub {
    type: 'generateReportActivity';
    collectEvent: EventStub;
}

interface DelayEventActivityStub {
    type: 'delayEventActivity';
    event: EventStub;
}

interface RecurringEventActivityStub {
    type: 'recurringEventActivity';
    event: EventStub;
}

interface SendRemoteEventActivityStub {
    type: 'sendRemoteEventActivity';
    event: EventStub;
}

type EventStub =
    | EventWithIdStub
    | {
          type: Exclude<
              | 'materialAvailableEvent'
              | 'newPatientEvent'
              | 'personnelAvailableEvent'
              | 'resourceRequiredEvent'
              | 'transferConnectionMissingEvent'
              | 'treatmentsTimerEvent'
              | 'vehiclesSentEvent',
              unknown
          >;
      };

interface EventWithIdStub {
    type:
        | 'materialAvailableEvent'
        | 'newPatientEvent'
        | 'personnelAvailableEvent'
        | 'resourceRequiredEvent'
        | 'transferConnectionMissingEvent'
        | 'treatmentsTimerEvent'
        | 'vehiclesSentEvent';
    id: string | undefined;
}

export const removeIdFromEvents32: Migration = {
    action: null,

    state: (state) => {
        const typedState = state as {
            simulatedRegions: {
                [key: string]: SimulatedRegionStub;
            };
        };

        Object.values(typedState.simulatedRegions).forEach(
            (simulatedRegion) => {
                simulatedRegion.inEvents.forEach((event) => {
                    tryMigrateEvent(event);
                });
            }
        );

        Object.values(typedState.simulatedRegions).forEach(
            (simulatedRegion) => {
                Object.values(simulatedRegion.activities).forEach(
                    (activityState) => {
                        if (
                            activityState.type === 'delayEventActivity' ||
                            activityState.type === 'recurringEventActivity' ||
                            activityState.type === 'sendRemoteEventActivity'
                        ) {
                            tryMigrateEvent(activityState.event);
                        }
                        if (activityState.type === 'generateReportActivity') {
                            tryMigrateEvent(activityState.collectEvent);
                        }
                    }
                );
            }
        );
    },
};

function tryMigrateEvent(event: EventStub) {
    if (
        event.type === 'materialAvailableEvent' ||
        event.type === 'newPatientEvent' ||
        event.type === 'personnelAvailableEvent' ||
        event.type === 'resourceRequiredEvent' ||
        event.type === 'transferConnectionMissingEvent' ||
        event.type === 'treatmentsTimerEvent' ||
        event.type === 'vehiclesSentEvent'
    ) {
        delete event.id;
    }
}
