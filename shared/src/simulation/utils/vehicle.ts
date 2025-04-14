import type { SimulatedRegion, Vehicle } from '../../models/index.js';
import { createVehicleActionTag } from '../../models/utils/tag-helpers.js';
import {
    isInSpecificSimulatedRegion,
    isInSpecificVehicle,
    SimulatedRegionPosition,
} from '../../models/utils/index.js';
import { changePositionWithId } from '../../models/utils/position/position-helpers-mutable.js';
import type { ExerciseState } from '../../state.js';
import { getElement } from '../../store/action-reducers/utils/index.js';
import { logVehicle } from '../../store/action-reducers/utils/log.js';
import type { Mutable } from '../../utils/index.js';
import { NewPatientEvent } from '../events/index.js';
import { MaterialAvailableEvent } from '../events/material-available.js';
import { PersonnelAvailableEvent } from '../events/personnel-available.js';
import { sendSimulationEvent } from '../events/utils.js';

export function unloadVehicle(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    vehicle: Mutable<Vehicle>
) {
    if (!isInSpecificSimulatedRegion(vehicle, simulatedRegion.id)) {
        console.error(
            `Trying to unload a vehicle with id ${vehicle.id} into simulated region with id ${simulatedRegion.id} but the vehicle is not in that region.`
        );
        return;
    }

    logVehicle(
        draftState,
        [createVehicleActionTag(draftState, 'unloaded')],
        `${vehicle.name} wurde automatisch entladen`,
        vehicle.id
    );

    const loadedElements = [
        { uuidSet: vehicle.materialIds, elementType: 'material' },
        { uuidSet: vehicle.personnelIds, elementType: 'personnel' },
        { uuidSet: vehicle.patientIds, elementType: 'patient' },
    ] as const;

    for (const { uuidSet, elementType } of loadedElements) {
        for (const elementId of Object.keys(uuidSet)) {
            const element = getElement(draftState, elementType, elementId);
            if (isInSpecificVehicle(element, vehicle.id)) {
                changePositionWithId(
                    elementId,
                    SimulatedRegionPosition.create(simulatedRegion.id),
                    elementType,
                    draftState
                );

                switch (element.type) {
                    case 'material':
                        sendSimulationEvent(
                            simulatedRegion,
                            MaterialAvailableEvent.create(element.id)
                        );
                        break;
                    case 'personnel':
                        sendSimulationEvent(
                            simulatedRegion,
                            PersonnelAvailableEvent.create(element.id)
                        );
                        break;
                    case 'patient':
                        sendSimulationEvent(
                            simulatedRegion,
                            NewPatientEvent.create(element.id)
                        );
                        break;
                }
            }
        }
    }
    vehicle.patientIds = {};
}
