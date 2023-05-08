import type { Migration } from './migration-functions';

interface SimulatedRegionStub {
    inEvents: EventStub[];
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
                });
            }
        );
    },
};
