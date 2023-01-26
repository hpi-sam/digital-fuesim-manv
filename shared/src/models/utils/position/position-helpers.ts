import type { UUID } from '../../../utils';
import type { Transfer } from '../transfer';
import type { MapCoordinates } from './map-coordinates';
import type { MapPosition } from './map-position';
import type { Position } from './position';
import type { SimulatedRegionPosition } from './simulated-region-position';
import type { TransferPosition } from './transfer-position';
import type { VehiclePosition } from './vehicle-position';
import type { WithPosition } from './with-meta-position';

export function isOnMap(withPosition: WithPosition): boolean {
    return withPosition.metaPosition.type === 'coordinates';
}
export function isInVehicle(withPosition: WithPosition): boolean {
    return withPosition.metaPosition.type === 'vehicle';
}
export function isInTransfer(withPosition: WithPosition): boolean {
    return withPosition.metaPosition.type === 'transfer';
}
export function isInSimulatedRegion(withPosition: WithPosition): boolean {
    return withPosition.metaPosition.type === 'simulatedRegion';
}
export function isNotOnMap(withPosition: WithPosition): boolean {
    return !isOnMap(withPosition);
}
export function isNotInVehicle(withPosition: WithPosition): boolean {
    return !isInVehicle(withPosition);
}
export function isNotInTransfer(withPosition: WithPosition): boolean {
    return !isInVehicle(withPosition);
}
export function isNotInSimulatedRegion(withPosition: WithPosition): boolean {
    return !isInSimulatedRegion(withPosition);
}

export function coordinatesOf(withPosition: WithPosition): MapCoordinates {
    if (isOnMap(withPosition)) {
        return (withPosition.metaPosition as MapPosition).position;
    }
    throw new TypeError(
        `Expected metaPosition of object to be on Map. Was of type ${withPosition.metaPosition.type}.`
    );
}

export function vehicleItsIn(withPosition: WithPosition): UUID {
    if (isInVehicle(withPosition)) {
        return (withPosition.metaPosition as VehiclePosition).vehicleId;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in vehicle. Was of type ${withPosition.metaPosition.type}.`
    );
}

export function transferItsIn(withPosition: WithPosition): Transfer {
    if (isInTransfer(withPosition)) {
        return (withPosition.metaPosition as TransferPosition).transfer;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in transfer. Was of type ${withPosition.metaPosition.type}.`
    );
}

export function simulatedRegionItsIn(withPosition: WithPosition): UUID {
    if (isInSimulatedRegion(withPosition)) {
        return (withPosition.metaPosition as SimulatedRegionPosition)
            .simulatedRegionId;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in simulatedRegion. Was of type ${withPosition.metaPosition.type}.`
    );
}

export function isPositionOnMap(metaPosition: Position): boolean {
    return metaPosition.type === 'coordinates';
}
export function isPositionInVehicle(metaPosition: Position): boolean {
    return metaPosition.type === 'vehicle';
}
export function isPositionInTransfer(metaPosition: Position): boolean {
    return metaPosition.type === 'transfer';
}
export function isPositionInSimulatedRegion(metaPosition: Position): boolean {
    return metaPosition.type === 'simulatedRegion';
}
export function isPositionNotOnMap(metaPosition: Position): boolean {
    return !isPositionOnMap(metaPosition);
}
export function isPositionNotInVehicle(metaPosition: Position): boolean {
    return !isPositionInVehicle(metaPosition);
}
export function isPositionNotInTransfer(metaPosition: Position): boolean {
    return !isPositionInTransfer(metaPosition);
}
export function isPositionNotInSimulatedRegion(
    metaPosition: Position
): boolean {
    return !isPositionInSimulatedRegion(metaPosition);
}

export function coordinatesOfPosition(metaPosition: Position): MapCoordinates {
    if (isPositionOnMap(metaPosition)) {
        return (metaPosition as MapPosition).position;
    }
    throw new TypeError(
        `Expected metaPosition of object to be on Map. Was of type ${metaPosition.type}.`
    );
}

export function vehiclePositionIn(metaPosition: Position): UUID {
    if (isPositionInVehicle(metaPosition)) {
        return (metaPosition as VehiclePosition).vehicleId;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in vehicle. Was of type ${metaPosition.type}.`
    );
}

export function transferPositionIn(metaPosition: Position): Transfer {
    if (isPositionInTransfer(metaPosition)) {
        return (metaPosition as TransferPosition).transfer;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in transfer. Was of type ${metaPosition.type}.`
    );
}

export function simulatedRegionPositionIn(metaPosition: Position): UUID {
    if (isPositionInSimulatedRegion(metaPosition)) {
        return (metaPosition as SimulatedRegionPosition).simulatedRegionId;
    }
    throw new TypeError(
        `Expected metaPosition of object to be in simulatedRegion. Was of type ${metaPosition.type}.`
    );
}
