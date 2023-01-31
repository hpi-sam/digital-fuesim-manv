import type { UUID } from '../../../utils';
import type { Transfer } from '../transfer';
import type { MapCoordinates } from './map-coordinates';
import type { MapPosition } from './map-position';
import type { Position } from './position';
import type { SimulatedRegionPosition } from './simulated-region-position';
import type { TransferPosition } from './transfer-position';
import type { VehiclePosition } from './vehicle-position';
import type { WithPosition } from './with-position';

export function isOnMap(withPosition: WithPosition): boolean {
    return isPositionOnMap(withPosition.position);
}
export function isInVehicle(withPosition: WithPosition): boolean {
    return isPositionInVehicle(withPosition.position);
}
export function isInTransfer(withPosition: WithPosition): boolean {
    return isPositionInTransfer(withPosition.position);
}
export function isInSimulatedRegion(withPosition: WithPosition): boolean {
    return isPositionInSimulatedRegion(withPosition.position);
}
export function isNotOnMap(withPosition: WithPosition): boolean {
    return !isOnMap(withPosition);
}
export function isNotInVehicle(withPosition: WithPosition): boolean {
    return !isInVehicle(withPosition);
}
export function isNotInTransfer(withPosition: WithPosition): boolean {
    return !isInTransfer(withPosition);
}
export function isNotInSimulatedRegion(withPosition: WithPosition): boolean {
    return !isInSimulatedRegion(withPosition);
}

export function coordinatesOf(withPosition: WithPosition): MapCoordinates {
    if (isOnMap(withPosition)) {
        return coordinatesOfPosition(withPosition.position);
    }
    throw new TypeError(
        `Expected position of object to be on Map. Was of type ${withPosition.position.type}.`
    );
}

export function vehicleItsIn(withPosition: WithPosition): UUID {
    if (isInVehicle(withPosition)) {
        return vehiclePositionIsIn(withPosition.position);
    }
    throw new TypeError(
        `Expected position of object to be in vehicle. Was of type ${withPosition.position.type}.`
    );
}

export function transferItsIn(withPosition: WithPosition): Transfer {
    if (isInTransfer(withPosition)) {
        return transferPositionIsIn(withPosition.position);
    }
    throw new TypeError(
        `Expected position of object to be in transfer. Was of type ${withPosition.position.type}.`
    );
}

export function simulatedRegionItsIn(withPosition: WithPosition): UUID {
    if (isInSimulatedRegion(withPosition)) {
        return simulatedRegionPositionIsIn(withPosition.position);
    }
    throw new TypeError(
        `Expected position of object to be in simulatedRegion. Was of type ${withPosition.position.type}.`
    );
}

export function isPositionOnMap(position: Position): boolean {
    return position.type === 'coordinates';
}
export function isPositionInVehicle(position: Position): boolean {
    return position.type === 'vehicle';
}
export function isPositionInTransfer(position: Position): boolean {
    return position.type === 'transfer';
}
export function isPositionInSimulatedRegion(position: Position): boolean {
    return position.type === 'simulatedRegion';
}
export function isPositionNotOnMap(position: Position): boolean {
    return !isPositionOnMap(position);
}
export function isPositionNotInVehicle(position: Position): boolean {
    return !isPositionInVehicle(position);
}
export function isPositionNotInTransfer(position: Position): boolean {
    return !isPositionInTransfer(position);
}
export function isPositionNotInSimulatedRegion(position: Position): boolean {
    return !isPositionInSimulatedRegion(position);
}

export function coordinatesOfPosition(position: Position): MapCoordinates {
    if (isPositionOnMap(position)) {
        return (position as MapPosition).coordinates;
    }
    throw new TypeError(
        `Expected position to be on Map. Was of type ${position.type}.`
    );
}

export function vehiclePositionIsIn(position: Position): UUID {
    if (isPositionInVehicle(position)) {
        return (position as VehiclePosition).vehicleId;
    }
    throw new TypeError(
        `Expected position to be in vehicle. Was of type ${position.type}.`
    );
}

export function transferPositionIsIn(position: Position): Transfer {
    if (isPositionInTransfer(position)) {
        return (position as TransferPosition).transfer;
    }
    throw new TypeError(
        `Expected position to be in transfer. Was of type ${position.type}.`
    );
}

export function simulatedRegionPositionIsIn(position: Position): UUID {
    if (isPositionInSimulatedRegion(position)) {
        return (position as SimulatedRegionPosition).simulatedRegionId;
    }
    throw new TypeError(
        `Expected position to be in simulatedRegion. Was of type ${position.type}.`
    );
}
