import { SimulatedRegion, Vehicle } from '../../models';
import { SimulatedRegionPosition } from '../../models/utils';
import { changePositionWithId } from '../../models/utils/position/position-helpers-mutable';
import type { ExerciseState } from '../../state';
import { getElement } from '../../store/action-reducers/utils';
import type { Mutable } from '../../utils';

export function unloadVehicle(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    vehicle: Mutable<Vehicle>
) {
    if (!SimulatedRegion.isInSimulatedRegion(simulatedRegion, vehicle)) {
        console.error(
            `Trying to unload a vehicle with id ${vehicle.id} into simulated region with id ${simulatedRegion.id} but the vehicle is not in that region.`
        );
        return;
    }

    const loadedElements = [
        { uuidSet: vehicle.materialIds, elementType: 'material' },
        { uuidSet: vehicle.personnelIds, elementType: 'personnel' },
        { uuidSet: vehicle.patientIds, elementType: 'patient' },
    ] as const;

    for (const { uuidSet, elementType } of loadedElements) {
        for (const elementId of Object.keys(uuidSet)) {
            const element = getElement(draftState, elementType, elementId);
            if (Vehicle.isInVehicle(vehicle, element)) {
                changePositionWithId(
                    elementId,
                    SimulatedRegionPosition.create(simulatedRegion.id),
                    elementType,
                    draftState
                );
            }
        }
    }
    vehicle.patientIds = {};
}
