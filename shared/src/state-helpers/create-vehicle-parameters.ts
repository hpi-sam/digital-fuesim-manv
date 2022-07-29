import type { Vehicle, VehicleTemplate } from '../models';
import { Material, Personnel } from '../models';
import type { Position } from '../models/utils';
import { uuid } from '../utils';

import { arrayToUUIDSet } from '../utils/array-to-uuid-set';

/**
 * @returns a vehicle with personnel and materials to be added to the map
 */
// Be aware that `uuid()` is nondeterministic and cannot be used in a reducer function.
export function createVehicleParameters(
    vehicleTemplate: VehicleTemplate,
    vehiclePosition?: Position
): {
    materials: Material[];
    personnel: Personnel[];
    vehicle: Vehicle;
} {
    const vehicleId = uuid();
    const materials = vehicleTemplate.materials.map((currentMaterial) =>
        Material.create(vehicleId, vehicleTemplate.name, currentMaterial, {})
    );
    const personnel = vehicleTemplate.personnel.map((currentPersonnel) =>
        Personnel.create(vehicleId, vehicleTemplate.name, currentPersonnel, {})
    );

    const vehicle: Vehicle = {
        id: vehicleId,
        materialIds: arrayToUUIDSet(materials.map((m) => m.id)),
        vehicleType: vehicleTemplate.vehicleType,
        name: vehicleTemplate.name,
        patientCapacity: vehicleTemplate.patientCapacity,
        images: vehicleTemplate.images,
        currentImage: vehicleTemplate.images[0]!,
        patientIds: {},
        personnelIds: arrayToUUIDSet(personnel.map((p) => p.id)),
        position: vehiclePosition,
    };
    return {
        materials,
        personnel,
        vehicle,
    };
}
