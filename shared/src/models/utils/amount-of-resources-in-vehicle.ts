import type { ExerciseState } from '../../state';
import { getElement } from '../../store/action-reducers/utils';
import type { Mutable, UUID } from '../../utils';
import { isInSpecificVehicle } from './position/position-helpers';

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
