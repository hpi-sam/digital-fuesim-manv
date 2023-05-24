import type { SimulatedRegion, Vehicle } from '../../models';
import {
    createPatientStatusTag,
    createPatientTag,
    createVehicleActionTag,
} from '../../models/utils/tag-helpers';
import {
    isInSpecificSimulatedRegion,
    isInSpecificVehicle,
    SimulatedRegionPosition,
} from '../../models/utils';
import { changePositionWithId } from '../../models/utils/position/position-helpers-mutable';
import type { ExerciseState } from '../../state';
import { getElement } from '../../store/action-reducers/utils';
import { logVehicle } from '../../store/action-reducers/utils/log';
import type { Mutable, UUID } from '../../utils';
import { NewPatientEvent } from '../events';
import { MaterialAvailableEvent } from '../events/material-available';
import { PersonnelAvailableEvent } from '../events/personnel-available';
import { sendSimulationEvent } from '../events/utils';

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

    logVehicle(
        draftState,
        [
            createVehicleActionTag(draftState, 'unload'),
            ...Object.keys(vehicle.patientIds).flatMap((patientId: UUID) => {
                const patient = getElement(draftState, 'patient', patientId);
                return [
                    createPatientTag(draftState, patientId),
                    createPatientStatusTag(draftState, patient.realStatus),
                ];
            }),
        ],
        'Ein Fahrzeug wurde automatisch entladen',
        vehicle.id
    );
}
