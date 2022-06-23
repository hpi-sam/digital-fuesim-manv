import type { Vehicle } from '../../../../models';
import { Viewport, Material, Personnel } from '../../../../models';
import type { ExerciseState } from '../../../../state';
import type { Mutable } from '../../../../utils';
import { unloadVehicleReducer } from '../../vehicle';
import { calculateGrid, vehicleSpacing, offset } from './utils';

export function unloadAndPositionVehicles(
    state: Mutable<ExerciseState>,
    viewport: Viewport
): void {
    const vehicles = Object.values(state.vehicles).filter(
        (vehicle) =>
            vehicle.position &&
            Viewport.isInViewport(viewport, vehicle.position)
    );
    const vehiclesToUnload = getVehiclesToUnload(state, vehicles);
    positionVehicles(viewport, vehicles);
    unloadVehicles(state, vehiclesToUnload);
}

function unloadVehicles(
    state: Mutable<ExerciseState>,
    vehicles: Vehicle[]
): void {
    vehicles.forEach((vehicle) => unloadVehicleReducer(state, vehicle.id));
}

function positionVehicles(
    viewport: Viewport,
    vehicles: Mutable<Vehicle>[]
): void {
    if (vehicles.length === 0) {
        return;
    }
    const gridSize = calculateGrid(vehicles.length);
    // Make room for spacing
    const spacedGrid = {
        x: gridSize.width * vehicleSpacing.x,
        y: gridSize.height * vehicleSpacing.y,
    };
    if (
        viewport.size.width < spacedGrid.x ||
        viewport.size.height < spacedGrid.y
    ) {
        return;
    }
    const gridBottomLeft = {
        x: viewport.position.x + viewport.size.width * offset,
        y:
            viewport.position.y -
            viewport.size.height +
            viewport.size.height * offset,
    };
    vehicles.forEach((vehicle, index) => {
        // TODO: This looks bad with the helicopter
        vehicle.position = {
            x: gridBottomLeft.x + (index % gridSize.width) * vehicleSpacing.x,
            y:
                gridBottomLeft.y +
                Math.floor(index / gridSize.width) * vehicleSpacing.y,
        };
    });
}

function getVehiclesToUnload(
    state: ExerciseState,
    vehicles: Vehicle[]
): Vehicle[] {
    return vehicles.filter((vehicle) => {
        const materials = Object.keys(vehicle.materialIds).map(
            (materialId) => state.materials[materialId]
        );
        const materialsInVehicle = materials.filter((material) =>
            Material.isInVehicle(material)
        );
        if (materialsInVehicle.length > 0) {
            return true;
        }
        const personnel = Object.keys(vehicle.personnelIds).map(
            (personnelId) => state.personnel[personnelId]
        );
        const personnelInVehicle = personnel.filter((thisPersonnel) =>
            Personnel.isInVehicle(thisPersonnel)
        );
        if (personnelInVehicle.length > 0) {
            return true;
        }
        return false;
    });
}
