import type { Vehicle } from '../../../models';
import {
    currentSimulatedRegionIdOf,
    isInSimulatedRegion,
    isInSpecificVehicle,
    isNotInTransfer,
    VehiclePosition,
} from '../../../models/utils';
import {
    changePosition,
    changePositionWithId,
} from '../../../models/utils/position/position-helpers-mutable';
import {
    MaterialRemovedEvent,
    PersonnelRemovedEvent,
} from '../../../simulation/events';
import { sendSimulationEvent } from '../../../simulation/events/utils';
import type { ExerciseState } from '../../../state';
import type { Mutable } from '../../../utils';
import { getElement } from './get-element';

/**
 * Checks whether all materials and personnel belonging to a vehicle are in it.
 *
 * @param draftState The state to operate in
 * @param vehicle The vehicle to check
 * @returns `true` if everything is in the vehicle, `false` otherwise
 */
export function isCompletelyLoaded(
    draftState: Mutable<ExerciseState>,
    vehicle: Mutable<Vehicle>
) {
    const materialsLoaded = Object.keys(vehicle.materialIds).map((materialId) =>
        isInSpecificVehicle(
            getElement(draftState, 'material', materialId),
            vehicle.id
        )
    );

    const personnelLoaded = Object.keys(vehicle.personnelIds).map(
        (personnelId) =>
            isInSpecificVehicle(
                getElement(draftState, 'personnel', personnelId),
                vehicle.id
            )
    );

    return (
        materialsLoaded.every((loaded) => loaded) &&
        personnelLoaded.every((loaded) => loaded)
    );
}

/**
 * Loads all materials and personnel belonging to a vehicle into it.
 * Personnel that is currently in transfer won't be loaded.
 *
 * @param draftState The state to operate in
 * @param vehicle The vehicle to load
 */
export function completelyLoadVehicle(
    draftState: Mutable<ExerciseState>,
    vehicle: Mutable<Vehicle>
) {
    const inSimulation = isInSimulatedRegion(vehicle);
    const simulatedRegionId = inSimulation
        ? currentSimulatedRegionIdOf(vehicle)
        : undefined;
    const simulatedRegion = inSimulation
        ? getElement(draftState, 'simulatedRegion', simulatedRegionId!)
        : undefined;

    const vehiclePosition = VehiclePosition.create(vehicle.id);

    Object.keys(vehicle.materialIds).forEach((materialId) => {
        changePositionWithId(
            materialId,
            vehiclePosition,
            'material',
            draftState
        );

        if (inSimulation) {
            sendSimulationEvent(
                simulatedRegion!,
                MaterialRemovedEvent.create(materialId)
            );
        }
    });

    Object.keys(vehicle.personnelIds).forEach((personnelId) => {
        const personnel = getElement(draftState, 'personnel', personnelId);

        if (isNotInTransfer(personnel)) {
            changePosition(personnel, vehiclePosition, draftState);

            if (inSimulation) {
                sendSimulationEvent(
                    simulatedRegion!,
                    PersonnelRemovedEvent.create(personnelId)
                );
            }
        }
    });
}
