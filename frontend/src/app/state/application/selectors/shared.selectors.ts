import { createSelector } from '@ngrx/store';
import type {
    MapImage,
    Material,
    Patient,
    Personnel,
    Position,
    SimulatedRegion,
    TransferPoint,
    UUID,
    Vehicle,
} from 'digital-fuesim-manv-shared';
import { Viewport } from 'digital-fuesim-manv-shared';
import { pickBy } from 'lodash-es';
import type { WithPosition } from 'src/app/pages/exercises/exercise/shared/utility/types/with-position';
import type { CateringLine } from 'src/app/shared/types/catering-line';
import type { AppState } from '../../app.state';
import {
    selectExerciseStateMode,
    selectOwnClientId,
} from './application.selectors';
import {
    selectClients,
    selectMapImages,
    selectMaterials,
    selectPatients,
    selectPersonnel,
    selectSimulatedRegion,
    selectTransferPoints,
    selectVehicles,
    selectViewports,
} from './exercise.selectors';

/**
 * All selectors in here use exercise- as well as application-selectors
 */

export const selectOwnClient = createSelector(
    selectOwnClientId,
    selectClients,
    (ownClientId, clients) => (ownClientId ? clients[ownClientId] : undefined)
);

/**
 * @deprecated Do not use this to distinguish between the exerciseStateModes
 */
export const selectCurrentRole = createSelector(
    selectExerciseStateMode,
    selectOwnClient,
    (mode, ownClient) => (mode === 'exercise' ? ownClient!.role : mode)
);

export const selectRestrictedViewport = createSelector(
    selectOwnClient,
    selectViewports,
    (ownClient, viewports) =>
        ownClient?.viewRestrictedToViewportId
            ? viewports[ownClient.viewRestrictedToViewportId]!
            : undefined
);

/**
 * @returns a selector that returns a UUIDMap of all elements that have a position and are in the viewport restriction
 */
function selectVisibleElementsFactory<
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
    return createSelector(
        selectRestrictedViewport,
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
export const selectVisibleMaterials =
    selectVisibleElementsFactory<Material>(selectMaterials);
export const selectVisibleVehicles =
    selectVisibleElementsFactory<Vehicle>(selectVehicles);
export const selectVisiblePersonnel =
    selectVisibleElementsFactory<Personnel>(selectPersonnel);
export const selectVisiblePatients =
    selectVisibleElementsFactory<Patient>(selectPatients);
export const selectVisibleViewports = selectVisibleElementsFactory<Viewport>(
    selectViewports,
    // The viewport the client is restricted to should not be shown, as this causes a white border in fullscreen mode
    (element, viewport) => element.id !== viewport.id
);
export const selectVisibleMapImages = selectVisibleElementsFactory<MapImage>(
    selectMapImages,
    // TODO: MapImages could get very big. Therefore its size must be taken into account. The current implementation is a temporary solution.
    (element, viewport) => true
);
export const selectVisibleTransferPoints =
    selectVisibleElementsFactory<TransferPoint>(selectTransferPoints);
export const selectVisibleSimulatedRegions =
    selectVisibleElementsFactory<SimulatedRegion>(selectSimulatedRegion);

export const selectVisibleCateringLines = createSelector(
    selectRestrictedViewport,
    selectMaterials,
    selectPersonnel,
    selectPatients,
    (viewport, materials, personnel, patients) =>
        // Mostly, there are fewer untreated patients than materials and personnel that are not treating
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
                    // If the catering element is treating a patient, it must have a position
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
