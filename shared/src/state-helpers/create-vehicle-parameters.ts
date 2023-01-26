import type { Vehicle, VehicleTemplate } from '../models';
import { Material, Personnel } from '../models';
import type { MaterialTemplate } from '../models/material-template';
import type { PersonnelTemplate } from '../models/personnel-template';
import type { PersonnelType, Position } from '../models/utils';
import { MapPosition } from '../models/utils/map-position';
import type { MaterialType } from '../models/utils/material-type';
import { VehiclePosition } from '../models/utils/vehicle-position';
import { uuid } from '../utils';

import { arrayToUUIDSet } from '../utils/array-to-uuid-set';

/**
 * @returns a vehicle with personnel and materials to be added to the map
 */
// Be aware that `uuid()` is nondeterministic and cannot be used in a reducer function.
export function createVehicleParameters(
    vehicleTemplate: VehicleTemplate,
    materialTemplates: {
        [Key in MaterialType]: MaterialTemplate;
    },
    personnelTemplates: {
        [Key in PersonnelType]: PersonnelTemplate;
    },
    vehiclePosition: Position
): {
    materials: Material[];
    personnel: Personnel[];
    vehicle: Vehicle;
} {
    const vehicleId = uuid();
    const materials = vehicleTemplate.materials.map((currentMaterial) =>
        Material.generateMaterial(
            materialTemplates[currentMaterial],
            vehicleId,
            vehicleTemplate.name,
            VehiclePosition.create(vehicleId)
        )
    );
    const personnel = vehicleTemplate.personnel.map((currentPersonnel) =>
        Personnel.generatePersonnel(
            personnelTemplates[currentPersonnel],
            vehicleId,
            vehicleTemplate.name,
            VehiclePosition.create(vehicleId)
        )
    );

    const vehicle: Vehicle = {
        id: vehicleId,
        materialIds: arrayToUUIDSet(materials.map((m) => m.id)),
        vehicleType: vehicleTemplate.vehicleType,
        name: vehicleTemplate.name,
        patientCapacity: vehicleTemplate.patientCapacity,
        image: vehicleTemplate.image,
        patientIds: {},
        personnelIds: arrayToUUIDSet(personnel.map((p) => p.id)),
        position: vehiclePosition,
        metaPosition: MapPosition.create(vehiclePosition),
    };
    return {
        materials,
        personnel,
        vehicle,
    };
}
