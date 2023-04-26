import type { Vehicle, VehicleTemplate } from '../models';
import { Material, Personnel } from '../models';
import type { MaterialTemplate } from '../models/material-template';
import type { PersonnelTemplate } from '../models/personnel-template';
import type { PersonnelType, MapCoordinates } from '../models/utils';
import { MapPosition } from '../models/utils/position/map-position';
import type { MaterialType } from '../models/utils/material-type';
import { VehiclePosition } from '../models/utils/position/vehicle-position';

import { arrayToUUIDSet } from '../utils/array-to-uuid-set';
import { NoOccupation } from '../models/utils/occupations/no-occupation';
import type { UUID } from '../utils';

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
): {
    materials: Material[];
    personnel: Personnel[];
    vehicle: Vehicle;
} {
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
    return {
        materials,
        personnel,
        vehicle,
    };
}
