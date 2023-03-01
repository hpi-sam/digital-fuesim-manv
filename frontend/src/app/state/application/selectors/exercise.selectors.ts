import { createSelector } from '@ngrx/store';
import type {
    ExerciseState,
    Personnel,
    UUID,
    Vehicle,
} from 'digital-fuesim-manv-shared';
import { isInTransfer, currentCoordinatesOf } from 'digital-fuesim-manv-shared';
import type { TransferLine } from 'src/app/shared/types/transfer-line';
import type { AppState } from '../../app.state';

// Properties

/**
 * Check before via selectExerciseStateMode whether the exerciseState is defined
 */
export const selectExerciseState = (state: AppState) =>
    // TODO: we currently expect this to only be used of the exerciseStateMode is not undefined
    state.application.exerciseState!;

function selectPropertyFactory<Key extends keyof ExerciseState>(key: Key) {
    return createSelector(selectExerciseState, (exercise) => exercise[key]);
}

// UUIDMap properties
export const selectViewports = selectPropertyFactory('viewports');
export const selectSimulatedRegion = selectPropertyFactory('simulatedRegions');
export const selectMapImages = selectPropertyFactory('mapImages');
export const selectPatients = selectPropertyFactory('patients');
export const selectVehicles = selectPropertyFactory('vehicles');
export const selectPersonnel = selectPropertyFactory('personnel');
export const selectAlarmGroups = selectPropertyFactory('alarmGroups');
export const selectMaterials = selectPropertyFactory('materials');
export const selectTransferPoints = selectPropertyFactory('transferPoints');
export const selectHospitals = selectPropertyFactory('hospitals');
export const selectHospitalPatients = selectPropertyFactory('hospitalPatients');
export const selectClients = selectPropertyFactory('clients');
// Array properties
export const selectVehicleTemplates = selectPropertyFactory('vehicleTemplates');
export const selectPersonnelTemplates =
    selectPropertyFactory('personnelTemplates');
export const selectMaterialTemplates =
    selectPropertyFactory('materialTemplates');
export const selectMapImagesTemplates =
    selectPropertyFactory('mapImageTemplates');
export const selectPatientCategories =
    selectPropertyFactory('patientCategories');
// Misc properties
export const selectConfiguration = selectPropertyFactory('configuration');
export const selectEocLogEntries = selectPropertyFactory('eocLog');
export const selectExerciseStatus = selectPropertyFactory('currentStatus');
export const selectParticipantId = selectPropertyFactory('participantId');
export const selectCurrentTime = selectPropertyFactory('currentTime');

// Elements

function createSelectElementFromMapFactory<Element>(
    elementsSelector: (state: AppState) => { [key: UUID]: Element }
) {
    return (id: UUID) =>
        createSelector(elementsSelector, (elements) => elements[id]!);
}

// Element from UUIDMap
export const createSelectAlarmGroup =
    createSelectElementFromMapFactory(selectAlarmGroups);
export const createSelectPersonnel =
    createSelectElementFromMapFactory(selectPersonnel);
export const createSelectMaterial =
    createSelectElementFromMapFactory(selectMaterials);
export const createSelectPatient =
    createSelectElementFromMapFactory(selectPatients);
export const createSelectVehicle =
    createSelectElementFromMapFactory(selectVehicles);
export const createSelectMapImage =
    createSelectElementFromMapFactory(selectMapImages);
export const createSelectTransferPoint =
    createSelectElementFromMapFactory(selectTransferPoints);
export const createSelectHospital =
    createSelectElementFromMapFactory(selectHospitals);
export const createSelectViewport =
    createSelectElementFromMapFactory(selectViewports);
export const createSelectSimulatedRegion = createSelectElementFromMapFactory(
    selectSimulatedRegion
);
export const createSelectClient =
    createSelectElementFromMapFactory(selectClients);

function createSelectElementFromArrayFactory<Element extends { id: UUID }>(
    elementsSelector: (state: AppState) => readonly Element[]
) {
    return (id: UUID) =>
        createSelector(
            elementsSelector,
            (elements) => elements.find((element) => element.id === id)!
        );
}

// Element from Array
export const createSelectMapImageTemplate = createSelectElementFromArrayFactory(
    selectMapImagesTemplates
);
export const createSelectVehicleTemplate = createSelectElementFromArrayFactory(
    selectVehicleTemplates
);

// Misc selectors

export const selectTileMapProperties = createSelector(
    selectConfiguration,
    (configuration) => configuration.tileMapProperties
);

export const selectTransferLines = createSelector(
    selectTransferPoints,
    (transferPoints) =>
        Object.values(transferPoints)
            .flatMap((transferPoint) =>
                Object.entries(transferPoint.reachableTransferPoints).map(
                    ([connectedId, { duration }]) => ({
                        id: `${transferPoint.id}:${connectedId}` as const,
                        startPosition: currentCoordinatesOf(transferPoint),
                        endPosition: currentCoordinatesOf(
                            transferPoints[connectedId]!
                        ),
                        duration,
                    })
                )
            )
            .reduce<{ [id: string]: TransferLine }>(
                (transferLines, transferLine) => {
                    transferLines[transferLine.id] = transferLine;
                    return transferLines;
                },
                {}
            )
);

export function createSelectReachableTransferPoints(transferPointId: UUID) {
    return createSelector(
        selectTransferPoints,
        createSelectTransferPoint(transferPointId),
        (transferPoints, transferPoint) =>
            Object.keys(transferPoint.reachableTransferPoints).map(
                (id) => transferPoints[id]!
            )
    );
}

export function createSelectReachableHospitals(transferPointId: UUID) {
    return createSelector(
        selectHospitals,
        createSelectTransferPoint(transferPointId),
        (hospitals, transferPoint) =>
            Object.keys(transferPoint.reachableHospitals).map(
                (id) => hospitals[id]!
            )
    );
}

export const selectVehiclesInTransfer = createSelector(
    selectVehicles,
    (vehicles) =>
        Object.values(vehicles).filter((vehicle) =>
            isInTransfer(vehicle)
        ) as Vehicle[]
);

export const selectPersonnelInTransfer = createSelector(
    selectPersonnel,
    (personnel) =>
        Object.values(personnel).filter((_personnel) =>
            isInTransfer(_personnel)
        ) as Personnel[]
);
