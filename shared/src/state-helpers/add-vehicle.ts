import type { Vehicle, VehicleTemplate } from '../models';
import { Material, Personnel } from '../models';
import type { Position } from '../models/utils';
import { uuid } from '../utils';

import { arrayToUUIDSet } from '../utils/array-to-uuid-set';

/**
 * @returns a vehicle with personnel and materials to be added to the map
 */
// Be aware that `uuid()` is nondeterministic and cannot be used in a reducer function.
export function addVehicle(
    vehicleTemplate: VehicleTemplate,
    vehiclePosition?: Position
): {
    material: Material[];
    personnel: Personnel[];
    vehicle: Vehicle;
} {
    const vehicleId = uuid();
    const material: Material[] = [];
    for (const materials of vehicleTemplate.material)
    {
        material.push(Material.create(vehicleId, {}, materials));
    };
    const personnel: Personnel[] = [];
    for (const personnelType of vehicleTemplate.personnel) {
        const newPersonnel = Personnel.create(vehicleId, personnelType, {});
        personnel.push(newPersonnel);
    }

    const vehicle: Vehicle = {
        id: vehicleId,
        materialIds: arrayToUUIDSet(material.map((m) => m.id)),
        name: vehicleTemplate.name,
        patientCapacity: vehicleTemplate.patientCapacity,
        image: vehicleTemplate.image,
        patientIds: {},
        personnelIds: arrayToUUIDSet(personnel.map((p) => p.id)),
        position: vehiclePosition,
    };
    return {
        material,
        personnel,
        vehicle,
    };
}
