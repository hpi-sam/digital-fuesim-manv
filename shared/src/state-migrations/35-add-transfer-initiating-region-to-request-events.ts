import type { Migration } from './migration-functions';

interface VehiclesSentEventStub {
    type: 'vehiclesSentEvent';
    destinationTransferPointId?: string;
    key?: string;
}

interface TransferVehiclesRequestEventStub {
    type: 'transferVehiclesRequestEvent';
    transferInitiatingRegionId?: string;
}
interface TransferSpecificVehicleRequestEventStub {
    type: 'transferSpecificVehicleRequestEvent';
    transferInitiatingRegionId?: string;
}
interface TransferPatientsRequestEventStub {
    type: 'transferPatientsRequestEvent';
    transferInitiatingRegionId?: string;
}
interface TransferPatientsInSpecificVehicleRequestEventStub {
    type: 'transferPatientsInSpecificVehicleRequestEvent';
    transferInitiatingRegionId?: string;
}

type EventStub =
    | TransferPatientsInSpecificVehicleRequestEventStub
    | TransferPatientsRequestEventStub
    | TransferSpecificVehicleRequestEventStub
    | TransferVehiclesRequestEventStub
    | VehiclesSentEventStub
    | {
          type: Exclude<
              | 'transferPatientsInSpecificVehicleRequestEvent'
              | 'transferPatientsRequestEvent'
              | 'transferSpecificVehicleRequestEvent'
              | 'transferVehiclesRequestEvent'
              | 'vehiclesSentEvent',
              unknown
          >;
      };

interface SimulatedRegionStub {
    id: string;
    inEvents: EventStub[];
}

interface SimulatedRegionPositionStub {
    type: 'simulatedRegion';
    simulatedRegionId: string;
}

type PositionStub =
    | SimulatedRegionPositionStub
    | {
          type: Exclude<'simulatedRegion', unknown>;
      };

interface TransferPointStub {
    id: string;
    position: PositionStub;
}

export const addTransferInitiatingRegionToRequestEvents35: Migration = {
    action: null,
    state: (state) => {
        const typedState = state as {
            simulatedRegions: {
                [key: string]: SimulatedRegionStub;
            };
            transferPoints: {
                [key: string]: TransferPointStub;
            };
        };

        Object.values(typedState.simulatedRegions).forEach(
            (simulatedRegion) => {
                simulatedRegion.inEvents.forEach((event) => {
                    if (
                        event.type ===
                            'transferPatientsInSpecificVehicleRequestEvent' ||
                        event.type === 'transferPatientsRequestEvent' ||
                        event.type === 'transferSpecificVehicleRequestEvent' ||
                        event.type === 'transferVehiclesRequestEvent'
                    ) {
                        event.transferInitiatingRegionId = simulatedRegion.id;
                    }

                    if (event.type === 'vehiclesSentEvent') {
                        const transferPointOfRegion = Object.values(
                            typedState.transferPoints
                        ).find(
                            (transferPoint) =>
                                // Disabled due to incomplete typings in the migration
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                transferPoint.position.type ===
                                    'simulatedRegion' &&
                                transferPoint.position.simulatedRegionId ===
                                    simulatedRegion.id
                        );

                        if (!transferPointOfRegion) {
                            throw new Error(
                                `Could not find transfer point for simulated region ${simulatedRegion.id}`
                            );
                        }

                        event.destinationTransferPointId =
                            transferPointOfRegion.id;

                        event.key = undefined;
                    }
                });
            }
        );
    },
};
