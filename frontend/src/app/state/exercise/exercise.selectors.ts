import { createSelector } from '@ngrx/store';
import type {
    ExerciseState,
    Personnel,
    Transfer,
    UUID,
    Vehicle,
} from 'digital-fuesim-manv-shared';
import { Viewport } from 'digital-fuesim-manv-shared';
import { pickBy } from 'lodash-es';
import type { WithPosition } from 'src/app/pages/exercises/exercise/shared/utility/types/with-position';
import type { CateringLine } from 'src/app/shared/types/catering-line';
import type { TransferLine } from 'src/app/shared/types/transfer-line';
import type { AppState } from '../app.state';

// Properties

function selectProperty<Key extends keyof ExerciseState>(key: Key) {
    return (state: AppState) => state.exercise[key];
}

// UUIDMap properties
export const selectViewports = selectProperty('viewports');
export const selectMapImages = selectProperty('mapImages');
export const selectPatients = selectProperty('patients');
export const selectVehicles = selectProperty('vehicles');
export const selectPersonnel = selectProperty('personnel');
export const selectAlarmGroups = selectProperty('alarmGroups');
export const selectMaterials = selectProperty('materials');
export const selectTransferPoints = selectProperty('transferPoints');
export const selectHospitals = selectProperty('hospitals');
export const selectHospitalPatients = selectProperty('hospitalPatients');
export const selectClients = selectProperty('clients');
// Array properties
export const selectVehicleTemplates = selectProperty('vehicleTemplates');
export const selectMapImagesTemplates = selectProperty('mapImageTemplates');
export const selectPatientCategories = selectProperty('patientCategories');
// Misc properties
export const selectConfiguration = selectProperty('configuration');
export const selectEocLogEntries = selectProperty('eocLog');
export const selectExerciseStatus = selectProperty('currentStatus');
export const selectParticipantId = selectProperty('participantId');
export const selectCurrentTime = selectProperty('currentTime');

// Elements

function getSelectElementFromMap<Element>(
    elementsSelector: (state: AppState) => { [key: UUID]: Element }
) {
    return (id: UUID) =>
        createSelector(elementsSelector, (elements) => elements[id]!);
}

// Element from UUIDMap
export const getSelectAlarmGroup = getSelectElementFromMap(selectAlarmGroups);
export const getSelectPersonnel = getSelectElementFromMap(selectPersonnel);
export const getSelectMaterial = getSelectElementFromMap(selectMaterials);
export const getSelectPatient = getSelectElementFromMap(selectPatients);
export const getSelectVehicle = getSelectElementFromMap(selectVehicles);
export const getSelectMapImage = getSelectElementFromMap(selectMapImages);
export const getSelectTransferPoint =
    getSelectElementFromMap(selectTransferPoints);
export const getSelectHospital = getSelectElementFromMap(selectHospitals);
export const getSelectViewport = getSelectElementFromMap(selectViewports);
export const getSelectClient = getSelectElementFromMap(selectClients);

function getSelectElementFromArray<Element extends { id: UUID }>(
    elementsSelector: (state: AppState) => readonly Element[]
) {
    return (id: UUID) =>
        createSelector(
            elementsSelector,
            (elements) => elements.find((element) => element.id === id)!
        );
}

// Element from Array
export const getSelectMapImageTemplate = getSelectElementFromArray(
    selectMapImagesTemplates
);
export const getSelectVehicleTemplate = getSelectElementFromArray(
    selectVehicleTemplates
);

// Misc selectors

export const selectTileMapProperties = createSelector(
    selectConfiguration,
    (configuration) => configuration.tileMapProperties
);

// The clientId is only optional, to make working with typings easier
export const getSelectRestrictedViewport = (clientId?: UUID | null) =>
    clientId
        ? createSelector(
              getSelectClient(clientId),
              selectViewports,
              (client, viewports) =>
                  client?.viewRestrictedToViewportId
                      ? viewports[client.viewRestrictedToViewportId!]
                      : undefined
          )
        : (state: AppState) => undefined;

/**
 * @returns a selector that returns a dictionary of all elements that have a position and are in the viewport restriction
 * Only the position is taken into account. Eventual height and width of the element is ignored.
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
    return createSelector(
        getSelectRestrictedViewport(clientId),
        selectProperty(key),
        (restrictedViewport, elements) =>
            pickBy(
                elements,
                (element) =>
                    // is not in transfer
                    element.position &&
                    // no viewport restriction
                    (!restrictedViewport ||
                        Viewport.isInViewport(
                            restrictedViewport,
                            element.position
                        ))
            ) as ElementsWithPosition
    );
}

export const getSelectVisibleCateringLines = (clientId?: UUID | null) =>
    createSelector(
        getSelectRestrictedViewport(clientId),
        selectMaterials,
        selectPersonnel,
        selectPatients,
        (viewport, materials, personnel, patients) =>
            // There are mostly less patients that are not treated than materials and personnel that are not treating
            Object.values(patients)
                .filter((patient) => patient.position !== undefined)
                .flatMap((patient) =>
                    [
                        ...Object.keys(patient.assignedPersonnelIds).map(
                            (personnelId) => personnel[personnelId]!
                        ),
                        ...Object.keys(patient.assignedMaterialIds).map(
                            (materialId) => materials[materialId]!
                        ),
                    ].map((caterer) => ({
                        id: `${caterer.id}:${patient.id}` as const,
                        patientPosition: patient.position!,
                        // if the catering element is treating a patient, it must have a position
                        catererPosition: caterer.position!,
                    }))
                )
                // To improve performance, all Lines where both ends are not in the viewport
                // are removed as they are not visible for the user
                .filter(
                    ({ catererPosition, patientPosition }) =>
                        !viewport ||
                        Viewport.isInViewport(viewport, catererPosition) ||
                        Viewport.isInViewport(viewport, patientPosition)
                )
                .reduce<{ [id: `${UUID}:${UUID}`]: CateringLine }>(
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
