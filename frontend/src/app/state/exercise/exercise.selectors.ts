import { createSelector } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { ExerciseState, Viewport } from 'digital-fuesim-manv-shared';
import { pickBy } from 'lodash-es';
import type { WithPosition } from 'src/app/pages/exercises/exercise/shared/utility/types/with-position';
import type { CateringLine } from 'src/app/shared/types/catering-line';
import type { TransferLine } from 'src/app/shared/types/transfer-line';
import type { AppState } from '../app.state';

export const selectViewports = (state: AppState) => state.exercise.viewports;
export const selectMapImages = (state: AppState) => state.exercise.mapImages;
export const selectVehicleTemplates = (state: AppState) =>
    state.exercise.vehicleTemplates;
export const selectPatientTemplates = (state: AppState) =>
    state.exercise.patientTemplates;
export const selectMapImagesTemplates = (state: AppState) =>
    state.exercise.mapImageTemplates;
export const selectPatients = (state: AppState) => state.exercise.patients;
export const selectVehicles = (state: AppState) => state.exercise.vehicles;
export const selectPersonnel = (state: AppState) => state.exercise.personnel;
export const selectAlarmGroups = (state: AppState) =>
    state.exercise.alarmGroups;
export const getSelectPersonnel = (personnelId: UUID) => (state: AppState) =>
    state.exercise.personnel[personnelId];
export const selectMaterials = (state: AppState) => state.exercise.materials;
export const getSelectMaterial = (materialId: UUID) => (state: AppState) =>
    state.exercise.materials[materialId];
export const getSelectPatient = (patientId: UUID) => (state: AppState) =>
    state.exercise.patients[patientId];
export const getSelectMapImage = (mapImageId: UUID) => (state: AppState) =>
    state.exercise.mapImages[mapImageId];
export const getSelectVehicle = (vehicleId: UUID) => (state: AppState) =>
    state.exercise.vehicles[vehicleId];
// TODO: Refactor the !
export const getSelectVehicleTemplate =
    (vehicleTemplateId: UUID) => (state: AppState) =>
        state.exercise.vehicleTemplates.find(
            (vehicleTemplate) => vehicleTemplate.id === vehicleTemplateId
        )!;
export const getSelectAlarmGroup = (alarmGroupId: UUID) => (state: AppState) =>
    state.exercise.alarmGroups[alarmGroupId];
export const getSelectTransferPoint =
    (transferPointId: UUID) => (state: AppState) =>
        state.exercise.transferPoints[transferPointId];
export const getSelectViewport = (viewportId: UUID) => (state: AppState) =>
    state.exercise.viewports[viewportId];
export const getSelectRestrictedViewport =
    (clientId: UUID) => (state: AppState) =>
        state.exercise.clients[clientId].viewRestrictedToViewportId
            ? state.exercise.viewports[
                  state.exercise.clients[clientId].viewRestrictedToViewportId!
              ]
            : undefined;
export const selectTransferPoints = (state: AppState) =>
    state.exercise.transferPoints;

export const selectTileMapProperties = (state: AppState) =>
    state.exercise.tileMapProperties;

/**
 * @returns a selector that returns a dictionary of all elements that have a position and are in the viewport restriction
 */
export function getSelectVisibleElements<
    Key extends
        | 'materials'
        | 'patients'
        | 'personnel'
        | 'transferPoints'
        | 'vehicles',
    Elements extends AppState['exercise'][Key] = AppState['exercise'][Key],
    ElementsWithPosition extends {
        [Id in keyof Elements]: WithPosition<Elements[Id]>;
    } = { [Id in keyof Elements]: WithPosition<Elements[Id]> }
>(key: Key, clientId: UUID) {
    return (state: AppState): ElementsWithPosition => {
        const viewport = getSelectRestrictedViewport(clientId)(state);
        return pickBy(
            state.exercise[key],
            (element) =>
                // is not in transfer
                element.position &&
                // no viewport restriction
                (!viewport || Viewport.isInViewport(viewport, element.position))
        ) as ElementsWithPosition;
    };
}

export const selectClients = (state: AppState) => state.exercise.clients;
export const getSelectClient = (clientId: UUID) => (state: AppState) =>
    state.exercise.clients[clientId];

export const selectExerciseStatus = (state: AppState) =>
    ExerciseState.getStatus(state.exercise);

export const selectParticipantId = (state: AppState) =>
    state.exercise.participantId;

// TODO: only use the material and personnel in the current viewport
export const selectCateringLines = createSelector(
    selectMaterials,
    selectPersonnel,
    selectPatients,
    (materials, personnel, patients) =>
        [...Object.values(materials), ...Object.values(personnel)]
            .flatMap((element) => {
                if (element.position === undefined) {
                    return [];
                }
                return Object.keys(element.assignedPatientIds)
                    .map((patientId) => patients[patientId])
                    .filter((patient) => patient.position !== undefined)
                    .map((patient) => ({
                        id: `${element.id}:${patient.id}` as const,
                        catererPosition: element.position!,
                        patientPosition: patient.position!,
                    }));
            })
            .reduce<{ [id: string]: CateringLine }>(
                (cateringLinesObject, cateringLine) => {
                    cateringLinesObject[cateringLine.id] = cateringLine;
                    return cateringLinesObject;
                },
                {}
            )
);

export const selectTransferLines = createSelector(
    selectTransferPoints,
    (transferPoints) =>
        Object.values(transferPoints)
            .flatMap((transferPoint) =>
                Object.entries(transferPoint.reachableTransferPoints).map(
                    ([connectedId, { duration }]) => ({
                        id: `${transferPoint.id}:${connectedId}` as const,
                        startPosition: transferPoint.position,
                        endPosition: transferPoints[connectedId].position,
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

export function getSelectReachableTransferPoints(transferPointId: UUID) {
    return createSelector(selectTransferPoints, (transferPoints) =>
        Object.keys(
            transferPoints[transferPointId].reachableTransferPoints
        ).map((id) => transferPoints[id])
    );
}

export const selectVehiclesInTransfer = createSelector(
    selectVehicles,
    (vehicles) =>
        Object.values(vehicles).filter(
            (vehicle) => vehicle.transfer !== undefined
        )
);

export const selectPersonnelInTransfer = createSelector(
    selectPersonnel,
    (personnel) =>
        Object.values(personnel).filter(
            (_personnel) => _personnel.transfer !== undefined
        )
);

export const selectCurrentTime = (state: AppState) =>
    state.exercise.currentTime;
