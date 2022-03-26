import type { Immutable } from 'immer';
import type { Vehicle, VehicleTemplate } from '../models';
import { Material, Personell } from '../models';
import type { Position } from '../models/utils';
import { uuid } from '../utils';

import { arrayToUUIDSet } from '../utils/array-to-uuid-set';

/**
 * @returns a vehicle with personell and materials to be added to the map
 */
// Be aware that `uuid()` is nondeterministic and cannot be used in a reducer function.
export function addVehicle(
    vehicleTemplate: Immutable<VehicleTemplate>,
    vehiclePosition?: Position
): {
    material: Material;
    personell: Personell[];
    vehicle: Vehicle;
} {
    const vehicleId = uuid();
    const material: Material = {
        ...new Material(vehicleId, {}, vehicleTemplate.material),
    };
    const personell: Personell[] = [];
    for (const personellType of vehicleTemplate.personnel) {
        const newPersonell = new Personell(vehicleId, personellType, {});
        personell.push(newPersonell);
    }

    const vehicle: Vehicle = {
        id: vehicleId,
        materialId: material.id,
        name: vehicleTemplate.name,
        patientCapacity: vehicleTemplate.patientCapacity,
        image: vehicleTemplate.image,
        patientIds: {},
        personellIds: arrayToUUIDSet(personell.map((p) => p.id)),
        position: vehiclePosition,
    };
    return {
        material,
        personell,
        vehicle,
    };
}
