import type { Immutable } from 'immer';
import type {
    Personell,
    VehicleTemplate,
    Material,
    Vehicle,
    Position,
} from '..';
import { uuid } from '..';
import { arrayToUUIDSet } from '../utils/array-to-uuid-set';

/**
 * @returns a vehicle with personell and materials to be added to the map
 */
// Be aware that `uuid()` is nondeterministic and can not be used in a reducer function.
export function addVehicle(
    vehicleTemplate: Immutable<VehicleTemplate>,
    vehiclePosition?: Position
): {
    material: Material;
    personell: Personell[];
    vehicle: Vehicle;
} {
    const materialId = uuid();
    const vehicleId = uuid();
    const material: Material = {
        id: materialId,
        assignedPatientIds: {},
        canCaterFor: vehicleTemplate.material,
        vehicleId,
    };
    const personell: Personell[] = [];
    for (const personellType of vehicleTemplate.personnel) {
        const newPersonell: Personell = {
            id: uuid(),
            assignedPatientIds: {},
            personellType,
            vehicleId,
        };
        personell.push(newPersonell);
    }

    const vehicle: Vehicle = {
        id: vehicleId,
        materialId,
        name: vehicleTemplate.name,
        patientCapacity: vehicleTemplate.patientCapacity,
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
