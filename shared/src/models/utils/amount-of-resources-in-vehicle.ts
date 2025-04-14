import type { ExerciseState } from '../../state.js';
import { getElement } from '../../store/action-reducers/utils/index.js';
import type { Mutable, UUID } from '../../utils/index.js';
import { isInSpecificVehicle } from './position/position-helpers.js';

export function amountOfResourcesInVehicle(
    state: Mutable<ExerciseState>,
    vehicleId: UUID
) {
    const vehicle = getElement(state, 'vehicle', vehicleId);
    const amountOfPersonnel = Object.keys(vehicle.personnelIds).filter(
        (personnelId) =>
            isInSpecificVehicle(
                getElement(state, 'personnel', personnelId),
                vehicleId
            )
    ).length;
    const amountOfMaterial = Object.keys(vehicle.materialIds).filter(
        (materialId) =>
            isInSpecificVehicle(
                getElement(state, 'material', materialId),
                vehicleId
            )
    ).length;

    return amountOfPersonnel + amountOfMaterial;
}
