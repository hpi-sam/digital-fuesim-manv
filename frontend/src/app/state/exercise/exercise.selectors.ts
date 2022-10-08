import { createSelector } from '@ngrx/store';
import type {
    ExerciseState,
    MapImage,
    Material,
    Patient,
    Personnel,
    Position,
    Transfer,
    TransferPoint,
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
 * @returns a selector that returns a UUIDMap of all elements that have a position and are in the viewport restriction
 */
function getSelectVisibleElements<
    Element extends { readonly position?: Position },
    Elements extends { readonly [key: UUID]: Element } = {
        readonly [key: UUID]: Element;
    },
    ElementsWithPosition extends {
        [Id in keyof Elements]: WithPosition<Elements[Id]>;
    } = { [Id in keyof Elements]: WithPosition<Elements[Id]> }
>(
    selectElements: (state: AppState) => Elements,
    isInViewport: (
        element: WithPosition<Element>,
        viewport: Viewport
    ) => boolean = (element, viewport) =>
        Viewport.isInViewport(viewport, element.position)
) {
    return (clientId?: UUID | null) =>
        createSelector(
            getSelectRestrictedViewport(clientId),
            selectElements,
            (restrictedViewport, elements) =>
                pickBy(
                    elements,
                    (element) =>
                        // Is placed on the map
                        element.position &&
                        // No viewport restriction
                        (!restrictedViewport ||
                            isInViewport(
                                element as WithPosition<Element>,
                                restrictedViewport
                            ))
                ) as ElementsWithPosition
        );
}

// TODO: Take into account the width and height of the images of these elements
// (Blocked by a clear calculation between position and image dimensions #374)
export const getSelectVisibleMaterials =
    getSelectVisibleElements<Material>(selectMaterials);
export const getSelectVisibleVehicles =
    getSelectVisibleElements<Vehicle>(selectVehicles);
export const getSelectVisiblePersonnel =
    getSelectVisibleElements<Personnel>(selectPersonnel);
export const getSelectVisiblePatients =
    getSelectVisibleElements<Patient>(selectPatients);
export const getSelectVisibleViewports = getSelectVisibleElements<Viewport>(
    selectViewports,
    // The viewport the client is restricted to should not be shown, as this causes a white border around their screen in fullscreen mode
    (element, viewport) => element.id !== viewport.id
);
export const getSelectVisibleMapImages = getSelectVisibleElements<MapImage>(
    selectMapImages,
    // MapImages could get very big, therefore it's size must be taken into account
    (element, viewport) => true
);
export const getSelectVisibleTransferPoints =
    getSelectVisibleElements<TransferPoint>(selectTransferPoints);

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
