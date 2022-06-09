import { createSelector } from '@ngrx/store';
import type {
    UUID,
    Vehicle,
    Transfer,
    Personnel,
} from 'digital-fuesim-manv-shared';
import { Viewport, ExerciseState } from 'digital-fuesim-manv-shared';
import { pickBy } from 'lodash-es';
import type { WithPosition } from 'src/app/pages/exercises/exercise/shared/utility/types/with-position';
import type { CateringLine } from 'src/app/shared/types/catering-line';
import type { TransferLine } from 'src/app/shared/types/transfer-line';
import type { AppState } from '../app.state';

/**
 *
 * @param maybeValue A value that may be set, but may also be `undefined`
 * @returns `maybeValue` in case it's not `undefined`
 * @throws {@link TypeError} in case `maybeValue` is `undefined` -- disabled for now, only logs the error and returns `undefined` anyway
 */
function errorIfNotExists<T extends object>(maybeValue: T | undefined): T {
    if (maybeValue === undefined) {
        // TODO: Make it so that the optimistic update handler doesn't do this strange stuff.
        console.error(
            'Note that the following error may occur in the context of optimistic updates'
        );
        // TODO: Throw when this never happens
        console.error(new TypeError('A value was unexpectedly undefined'));
    }
    // TODO: Remove this type assertion once we can again safely throw above
    return maybeValue!;
}

export const selectViewports = (state: AppState) => state.exercise.viewports;
export const selectMapImages = (state: AppState) => state.exercise.mapImages;
export const selectVehicleTemplates = (state: AppState) =>
    state.exercise.vehicleTemplates;
export const selectPatientCategories = (state: AppState) =>
    state.exercise.patientCategories;
export const selectMapImagesTemplates = (state: AppState) =>
    state.exercise.mapImageTemplates;
export const getSelectMapImageTemplate =
    (mapImageTemplateId: UUID) => (state: AppState) =>
        errorIfNotExists(
            state.exercise.mapImageTemplates.find(
                (template) => template.id === mapImageTemplateId
            )
        );

export const selectPatients = (state: AppState) => state.exercise.patients;
export const selectVehicles = (state: AppState) => state.exercise.vehicles;
export const selectPersonnel = (state: AppState) => state.exercise.personnel;
export const selectAlarmGroups = (state: AppState) =>
    state.exercise.alarmGroups;
export const getSelectPersonnel = (personnelId: UUID) => (state: AppState) =>
    errorIfNotExists(state.exercise.personnel[personnelId]);
export const selectMaterials = (state: AppState) => state.exercise.materials;
export const getSelectMaterial = (materialId: UUID) => (state: AppState) =>
    errorIfNotExists(state.exercise.materials[materialId]);
export const getSelectPatient = (patientId: UUID) => (state: AppState) =>
    errorIfNotExists(state.exercise.patients[patientId]);
export const getSelectMapImage = (mapImageId: UUID) => (state: AppState) =>
    errorIfNotExists(state.exercise.mapImages[mapImageId]);
export const getSelectVehicle = (vehicleId: UUID) => (state: AppState) =>
    errorIfNotExists(state.exercise.vehicles[vehicleId]);
export const getSelectVehicleTemplate =
    (vehicleTemplateId: UUID) => (state: AppState) =>
        errorIfNotExists(
            state.exercise.vehicleTemplates.find(
                (vehicleTemplate) => vehicleTemplate.id === vehicleTemplateId
            )
        );
export const getSelectAlarmGroup = (alarmGroupId: UUID) => (state: AppState) =>
    errorIfNotExists(state.exercise.alarmGroups[alarmGroupId]);
export const getSelectTransferPoint =
    (transferPointId: UUID) => (state: AppState) =>
        errorIfNotExists(state.exercise.transferPoints[transferPointId]);
export const getSelectHospital = (hospitalId: UUID) => (state: AppState) =>
    errorIfNotExists(state.exercise.hospitals[hospitalId]);
export const getSelectViewport = (viewportId: UUID) => (state: AppState) =>
    errorIfNotExists(state.exercise.viewports[viewportId]);
export const getSelectRestrictedViewport =
    (clientId?: UUID | null) => (state: AppState) => {
        if (!clientId) {
            return undefined;
        }
        const client = getSelectClient(clientId)(state);
        return client?.viewRestrictedToViewportId
            ? state.exercise.viewports[client.viewRestrictedToViewportId!]
            : undefined;
    };
export const selectTransferPoints = (state: AppState) =>
    state.exercise.transferPoints;
export const selectHospitals = (state: AppState) => state.exercise.hospitals;

export const selectHospitalPatients = (state: AppState) =>
    state.exercise.hospitalPatients;

export const selectTileMapProperties = (state: AppState) =>
    state.exercise.configuration.tileMapProperties;
export const selectConfiguration = (state: AppState) =>
    state.exercise.configuration;
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
>(key: Key, clientId?: UUID | null) {
    return (state: AppState): ElementsWithPosition => {
        const viewport = clientId
            ? getSelectRestrictedViewport(clientId)(state)
            : undefined;
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
    errorIfNotExists(state.exercise.clients[clientId]);

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
                    .map((patientId) => patients[patientId]!)
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
                        endPosition: transferPoints[connectedId]!.position,
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
    return createSelector(
        selectTransferPoints,
        getSelectTransferPoint(transferPointId),
        (transferPoints, transferPoint) =>
            Object.keys(transferPoint.reachableTransferPoints).map(
                (id) => transferPoints[id]!
            )
    );
}

export function getSelectReachableHospitals(transferPointId: UUID) {
    return createSelector(
        selectHospitals,
        getSelectTransferPoint(transferPointId),
        (hospitals, transferPoint) =>
            Object.keys(transferPoint.reachableHospitals).map(
                (id) => hospitals[id]!
            )
    );
}

export const selectVehiclesInTransfer = createSelector(
    selectVehicles,
    (vehicles) =>
        Object.values(vehicles).filter(
            (vehicle) => vehicle.transfer !== undefined
        ) as (Vehicle & { transfer: Transfer })[]
);

export const selectPersonnelInTransfer = createSelector(
    selectPersonnel,
    (personnel) =>
        Object.values(personnel).filter(
            (_personnel) => _personnel.transfer !== undefined
        ) as (Personnel & { transfer: Transfer })[]
);

export const selectCurrentTime = (state: AppState) =>
    state.exercise.currentTime;
