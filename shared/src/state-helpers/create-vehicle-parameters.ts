import type { Vehicle, VehicleTemplate } from '../models/index.js';
import { VehicleParameters } from '../models/index.js';
import { Material, Personnel } from '../models/index.js';
import type { MaterialTemplate } from '../models/material-template.js';
import type { PersonnelTemplate } from '../models/personnel-template.js';
import type { PersonnelType, MapCoordinates } from '../models/utils/index.js';
import { MapPosition } from '../models/utils/position/map-position.js';
import type { MaterialType } from '../models/utils/material-type.js';
import { VehiclePosition } from '../models/utils/position/vehicle-position.js';

import { arrayToUUIDSet } from '../utils/array-to-uuid-set.js';
import { NoOccupation } from '../models/utils/occupations/no-occupation.js';
import type { UUID } from '../utils/index.js';

/**
 * @returns a vehicle with personnel and materials to be added to the map
 */
// Be aware that `uuid()` is nondeterministic and cannot be used in a reducer function.
export function createVehicleParameters(
    vehicleId: UUID,
    vehicleTemplate: VehicleTemplate,
    materialTemplates: {
        [Key in MaterialType]: MaterialTemplate;
    },
    personnelTemplates: {
        [Key in PersonnelType]: PersonnelTemplate;
    },
    vehiclePosition: MapCoordinates
): VehicleParameters {
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
        type: 'vehicle',
        materialIds: arrayToUUIDSet(materials.map((m) => m.id)),
        vehicleType: vehicleTemplate.vehicleType,
        name: vehicleTemplate.name,
        patientCapacity: vehicleTemplate.patientCapacity,
        image: vehicleTemplate.image,
        patientIds: {},
        personnelIds: arrayToUUIDSet(personnel.map((p) => p.id)),
        position: MapPosition.create(vehiclePosition),
        occupation: NoOccupation.create(),
    };

    return VehicleParameters.create(vehicle, materials, personnel);
}
