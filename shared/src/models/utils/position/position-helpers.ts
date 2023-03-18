import type { ExerciseState } from '../../../state';
import type { UUID } from '../../../utils';
import type { Transfer } from '../transfer';
import { MapCoordinates } from './map-coordinates';
import type { MapPosition } from './map-position';
import type { Position } from './position';
import type { SimulatedRegionPosition } from './simulated-region-position';
import type { TransferPosition } from './transfer-position';
import type { VehiclePosition } from './vehicle-position';
import type { WithExtent } from './with-extent';
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

export function isInSpecificVehicle(
    withPosition: WithPosition,
    vehicleId: UUID
): boolean {
    return (
        isInVehicle(withPosition) &&
        currentVehicleIdOf(withPosition) === vehicleId
    );
}

export function isInSpecificSimulatedRegion(
    withPosition: WithPosition,
    simulatedRegionId: UUID
): boolean {
    return (
        isInSimulatedRegion(withPosition) &&
        currentSimulatedRegionIdOf(withPosition) === simulatedRegionId
    );
}

export function currentCoordinatesOf(
    withPosition: WithPosition
): MapCoordinates {
    if (isOnMap(withPosition)) {
        return coordinatesOfPosition(withPosition.position);
    }
    throw new TypeError(
        `Expected position of object to be on Map. Was of type ${withPosition.position.type}.`
    );
}

export function currentVehicleIdOf(withPosition: WithPosition): UUID {
    if (isInVehicle(withPosition)) {
        return vehicleIdOfPosition(withPosition.position);
    }
    throw new TypeError(
        `Expected position of object to be in vehicle. Was of type ${withPosition.position.type}.`
    );
}

export function currentTransferOf(withPosition: WithPosition): Transfer {
    if (isInTransfer(withPosition)) {
        return transferOfPosition(withPosition.position);
    }
    throw new TypeError(
        `Expected position of object to be in transfer. Was of type ${withPosition.position.type}.`
    );
}

export function currentSimulatedRegionIdOf(withPosition: WithPosition): UUID {
    if (isInSimulatedRegion(withPosition)) {
        return simulatedRegionIdOfPosition(withPosition.position);
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

export function vehicleIdOfPosition(position: Position): UUID {
    if (isPositionInVehicle(position)) {
        return (position as VehiclePosition).vehicleId;
    }
    throw new TypeError(
        `Expected position to be in vehicle. Was of type ${position.type}.`
    );
}

export function transferOfPosition(position: Position): Transfer {
    if (isPositionInTransfer(position)) {
        return (position as TransferPosition).transfer;
    }
    throw new TypeError(
        `Expected position to be in transfer. Was of type ${position.type}.`
    );
}

export function simulatedRegionIdOfPosition(position: Position): UUID {
    if (isPositionInSimulatedRegion(position)) {
        return (position as SimulatedRegionPosition).simulatedRegionId;
    }
    throw new TypeError(
        `Expected position to be in simulatedRegion. Was of type ${position.type}.`
    );
}

export function upperLeftCornerOf(element: WithExtent): MapCoordinates {
    const centerCoordinate = currentCoordinatesOf(element);
    return MapCoordinates.create(
        centerCoordinate.x - element.size.width / 2,
        centerCoordinate.y + element.size.height / 2
    );
}

export function lowerRightCornerOf(element: WithExtent): MapCoordinates {
    const centerCoordinate = currentCoordinatesOf(element);
    return MapCoordinates.create(
        centerCoordinate.x + element.size.width / 2,
        centerCoordinate.y - element.size.height / 2
    );
}

export function nestedCoordinatesOf(
    withPosition: WithPosition,
    state: ExerciseState
): MapCoordinates {
    if (isOnMap(withPosition)) {
        return currentCoordinatesOf(withPosition);
    }
    if (isInVehicle(withPosition)) {
        const vehicleId = currentVehicleIdOf(withPosition);
        const vehicle = state.vehicles[vehicleId];
        if (!vehicle) {
            throw new Error(
                `The vehicle with the id ${vehicleId} could not be found`
            );
        }
        return nestedCoordinatesOf(vehicle, state);
    }
    if (isInSimulatedRegion(withPosition)) {
        const simulatedRegionId = currentSimulatedRegionIdOf(withPosition);
        const simulatedRegion = state.simulatedRegions[simulatedRegionId];
        if (!simulatedRegion) {
            throw new Error(
                `The simulated region with the id ${simulatedRegionId} could not be found`
            );
        }
        return currentCoordinatesOf(simulatedRegion);
    }
    throw new Error(
        `Expected element to have (nested) map position, but position was of type ${withPosition.position.type}`
    );
}
