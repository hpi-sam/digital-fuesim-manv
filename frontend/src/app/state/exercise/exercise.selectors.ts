import { createSelector } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { pickBy } from 'lodash-es';
import type { WithPosition } from 'src/app/pages/exercises/exercise/shared/utility/types/with-position';
import type { CateringLine } from 'src/app/shared/types/catering-line';
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
export const getSelectPersonnel = (personnelId: UUID) => (state: AppState) =>
    state.exercise.personnel[personnelId];
export const selectMaterials = (state: AppState) => state.exercise.materials;
export const getSelectMaterial = (materialId: UUID) => (state: AppState) =>
    state.exercise.materials[materialId];
export const getSelectPatient = (patientId: UUID) => (state: AppState) =>
    state.exercise.patients[patientId];
export const getSelectVehicle = (vehicleId: UUID) => (state: AppState) =>
    state.exercise.vehicles[vehicleId];
export const getSelectTransferPoint =
    (transferPointId: UUID) => (state: AppState) =>
        state.exercise.transferPoints[transferPointId];

/**
 * @returns a selector that returns a dictionary of all elements that have a position
 */
// TODO: probably also include that the position is in a viewport in the future
export function getSelectWithPosition<
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
>(key: Key) {
    return (state: AppState): ElementsWithPosition =>
        pickBy(
            state.exercise[key],
            (element) => element.position !== undefined
        ) as ElementsWithPosition;
}

export const selectClients = (state: AppState) => state.exercise.clients;
export const getSelectClient = (clientId: UUID) => (state: AppState) =>
    state.exercise.clients[clientId];

export const selectLatestStatusHistoryEntry = (state: AppState) =>
    state.exercise.statusHistory[state.exercise.statusHistory.length - 1];

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
