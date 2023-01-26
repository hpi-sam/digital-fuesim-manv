import type { UUID } from '../../../utils';
import type { Transfer } from '../transfer';
import type { MapCoordinates } from './map-coordinates';
import type { MapPosition } from './map-position';
import type { MetaPosition } from './meta-position';
import type { SimulatedRegionPosition } from './simulated-region-position';
import type { TransferPosition } from './transfer-position';
import type { VehiclePosition } from './vehicle-position';
import type { WithMetaPosition } from './with-meta-position';

export function isOnMap(withMetaPosition: WithMetaPosition): boolean {
    return withMetaPosition.metaPosition.type === 'coordinates';
}
export function isInVehicle(withMetaPosition: WithMetaPosition): boolean {
    return withMetaPosition.metaPosition.type === 'vehicle';
}
export function isInTransfer(withMetaPosition: WithMetaPosition): boolean {
    return withMetaPosition.metaPosition.type === 'transfer';
}
export function isInSimulatedRegion(
    withMetaPosition: WithMetaPosition
): boolean {
    return withMetaPosition.metaPosition.type === 'simulatedRegion';
}
export function isNotOnMap(withMetaPosition: WithMetaPosition): boolean {
    return !isOnMap(withMetaPosition);
}
export function isNotInVehicle(withMetaPosition: WithMetaPosition): boolean {
    return !isInVehicle(withMetaPosition);
}
export function isNotInTransfer(withMetaPosition: WithMetaPosition): boolean {
    return !isInVehicle(withMetaPosition);
}
export function isNotInSimulatedRegion(
    withMetaPosition: WithMetaPosition
): boolean {
    return !isInSimulatedRegion(withMetaPosition);
}

export function coordinatesOf(
    withMetaPosition: WithMetaPosition
): MapCoordinates {
    if (isOnMap(withMetaPosition)) {
        return (withMetaPosition.metaPosition as MapPosition).position;
    }
    throw new TypeError(
        `Expected metaPosition of object to be on Map. Was of type ${withMetaPosition.metaPosition.type}.`
    );
}

export function vehicleItsIn(withMetaPosition: WithMetaPosition): UUID {
    if (isInVehicle(withMetaPosition)) {
        return (withMetaPosition.metaPosition as VehiclePosition).vehicleId;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in vehicle. Was of type ${withMetaPosition.metaPosition.type}.`
    );
}

export function transferItsIn(withMetaPosition: WithMetaPosition): Transfer {
    if (isInTransfer(withMetaPosition)) {
        return (withMetaPosition.metaPosition as TransferPosition).transfer;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in transfer. Was of type ${withMetaPosition.metaPosition.type}.`
    );
}

export function simulatedRegionItsIn(withMetaPosition: WithMetaPosition): UUID {
    if (isInSimulatedRegion(withMetaPosition)) {
        return (withMetaPosition.metaPosition as SimulatedRegionPosition)
            .simulatedRegionId;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in simulatedRegion. Was of type ${withMetaPosition.metaPosition.type}.`
    );
}

export function isMetaPositionOnMap(metaPosition: MetaPosition): boolean {
    return metaPosition.type === 'coordinates';
}
export function isMetaPositionInVehicle(metaPosition: MetaPosition): boolean {
    return metaPosition.type === 'vehicle';
}
export function isMetaPositionInTransfer(metaPosition: MetaPosition): boolean {
    return metaPosition.type === 'transfer';
}
export function isMetaPositionInSimulatedRegion(
    metaPosition: MetaPosition
): boolean {
    return metaPosition.type === 'simulatedRegion';
}
export function isMetaPositionNotOnMap(metaPosition: MetaPosition): boolean {
    return !isMetaPositionOnMap(metaPosition);
}
export function isMetaPositionNotInVehicle(
    metaPosition: MetaPosition
): boolean {
    return !isMetaPositionInVehicle(metaPosition);
}
export function isMetaPositionNotInTransfer(
    metaPosition: MetaPosition
): boolean {
    return !isMetaPositionInTransfer(metaPosition);
}
export function isMetaPositionNotInSimulatedRegion(
    metaPosition: MetaPosition
): boolean {
    return !isMetaPositionInSimulatedRegion(metaPosition);
}

export function coordinatesOfMetaPosition(
    metaPosition: MetaPosition
): MapCoordinates {
    if (isMetaPositionOnMap(metaPosition)) {
        return (metaPosition as MapPosition).position;
    }
    throw new TypeError(
        `Expected metaPosition of object to be on Map. Was of type ${metaPosition.type}.`
    );
}

export function vehicleMetaPositionIn(metaPosition: MetaPosition): UUID {
    if (isMetaPositionInVehicle(metaPosition)) {
        return (metaPosition as VehiclePosition).vehicleId;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in vehicle. Was of type ${metaPosition.type}.`
    );
}

export function transferMetaPositionIn(metaPosition: MetaPosition): Transfer {
    if (isMetaPositionInTransfer(metaPosition)) {
        return (metaPosition as TransferPosition).transfer;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in transfer. Was of type ${metaPosition.type}.`
    );
}

export function simulatedRegionMetaPositionIn(
    metaPosition: MetaPosition
): UUID {
    if (isMetaPositionInSimulatedRegion(metaPosition)) {
        return (metaPosition as SimulatedRegionPosition).simulatedRegionId;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in simulatedRegion. Was of type ${metaPosition.type}.`
    );
}
