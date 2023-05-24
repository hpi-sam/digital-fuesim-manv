/**
 * This file should contain helper function to build tags for a specific category.
 * Their input should always be the current state and the specifier,
 * and they should figure out the color and name for the tag by themselves.
 */

import type { TreatmentProgress } from '../../simulation';
import { treatmentProgressToGermanNameDictionary } from '../../simulation/utils/treatment';
import type { ExerciseState } from '../../state';
import {
    getElement,
    getExerciseRadiogramById,
} from '../../store/action-reducers/utils/get-element';
import type { UUID } from '../../utils';
import type { Mutable } from '../../utils/immutability';
import { radiogramTypeToGermanDictionary } from '../radiogram/exercise-radiogram';
import type { ExerciseRadiogramStatus } from '../radiogram/status/exercise-radiogram-status';
import { radiogramStatusTypeToGermanDictionary } from '../radiogram/status/exercise-radiogram-status';
import { Tag } from '../tag';
import type { ExerciseOccupation } from './occupations';
import { occupationToGermanDictionary } from './occupations/exercise-occupation';
import { statusNames } from './patient-status';
import type { PatientStatus } from './patient-status';

export function createPatientStatusTag(
    _draftState: Mutable<ExerciseState>,
    patientStatus: PatientStatus
): Tag {
    return new Tag(
        'Sichtungskategorie',
        patientStatus,
        patientStatus === 'yellow' ? 'black' : 'white',
        statusNames[patientStatus],
        patientStatus
    );
}

export function createPatientTag(
    draftState: Mutable<ExerciseState>,
    patientId: UUID
): Tag {
    const patient = getElement(draftState, 'patient', patientId);
    return new Tag(
        'Patient',
        'cyan',
        'black',
        patient.personalInformation.name,
        patientId
    );
}

export function createRadiogramTypeTag(
    draftState: Mutable<ExerciseState>,
    radiogramId: UUID
): Tag {
    const radiogram = getExerciseRadiogramById(draftState, radiogramId);

    return new Tag(
        'Funkspruchtyp',
        'green',
        'white',
        radiogramTypeToGermanDictionary[radiogram.type],
        radiogram.type
    );
}

export function createRadiogramActionTag(
    _draftState: Mutable<ExerciseState>,
    radiogramStatus:
        | ExerciseRadiogramStatus['type']
        | 'resourcesPromised'
        | 'resourcesRejected'
): Tag {
    let name;
    if (radiogramStatus === 'resourcesPromised') {
        name = 'Ressourcen versprochen';
    } else if (radiogramStatus === 'resourcesRejected') {
        name = 'Ressourcen abgelehnt';
    } else {
        name = radiogramStatusTypeToGermanDictionary[radiogramStatus];
    }
    return new Tag(
        'Funkspruchaktion',
        'lightgreen',
        'black',
        name,
        radiogramStatus
    );
}

export function createSimulatedRegionTag(
    draftState: Mutable<ExerciseState>,
    simulatedRegionId: UUID
): Tag {
    const simulatedRegion = getElement(
        draftState,
        'simulatedRegion',
        simulatedRegionId
    );
    return new Tag(
        'Simulierter Bereich',
        'lightblue',
        'black',
        simulatedRegion.name,
        simulatedRegion.id
    );
}

export function createTransferPointTag(
    draftState: Mutable<ExerciseState>,
    transferPointId: UUID
): Tag {
    const transferPoint = getElement(
        draftState,
        'transferPoint',
        transferPointId
    );
    return new Tag(
        'Transferpunkt',
        'lightgreen',
        'black',
        transferPoint.externalName,
        transferPoint.id
    );
}

export function createTreatmentProgressTag(
    draftState: Mutable<ExerciseState>,
    treatmentProgress: TreatmentProgress
): Tag {
    return new Tag(
        'Behandlungsfortschritt',
        'orange',
        'white',
        treatmentProgressToGermanNameDictionary[treatmentProgress],
        treatmentProgress
    );
}

export function createVehicleTag(
    draftState: Mutable<ExerciseState>,
    vehicleId: UUID
): Tag {
    const vehicle = getElement(draftState, 'vehicle', vehicleId);
    return new Tag('Fahrzeug', 'grey', 'white', vehicle.name, vehicleId);
}

export function createVehicleTypeTag(
    draftState: Mutable<ExerciseState>,
    vehicleId: UUID
): Tag {
    const vehicle = getElement(draftState, 'vehicle', vehicleId);
    return new Tag(
        'Fahrzeugtyp',
        'grey',
        'white',
        vehicle.vehicleType,
        vehicle.vehicleType
    );
}

export function createOccupationTag(
    _draftState: Mutable<ExerciseState>,
    occupation: ExerciseOccupation
): Tag {
    return new Tag(
        'Tätigkeit',
        'white',
        'black',
        occupationToGermanDictionary[occupation.type],
        occupation.type
    );
}

export function createVehicleActionTag(
    _draftState: Mutable<ExerciseState>,
    vehicleAction: 'arrived' | 'departed' | 'load' | 'unload'
): Tag {
    let vehicleActionName;
    switch (vehicleAction) {
        case 'arrived':
            vehicleActionName = 'Angekommen';
            break;
        case 'departed':
            vehicleActionName = 'Losgefahren';
            break;
        case 'load':
            vehicleActionName = 'Beladen';
            break;
        case 'unload':
            vehicleActionName = 'Entladen';
            break;
    }
    return new Tag(
        'Fahrzeugaktion',
        'purple',
        'white',
        vehicleActionName,
        vehicleAction
    );
}

export function createHospitalTag(
    draftState: Mutable<ExerciseState>,
    hospitalId: UUID
): Tag {
    const hospital = getElement(draftState, 'hospital', hospitalId);
    return new Tag(
        'Krankenhaus',
        'firebrick',
        'white',
        hospital.name,
        hospitalId
    );
}
