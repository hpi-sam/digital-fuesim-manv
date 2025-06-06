import type { MapCoordinates } from '../../../models/utils/index.js';
import {
    currentCoordinatesOf,
    isNotOnMap,
    isOnMap,
} from '../../../models/utils/position/position-helpers.js';
import { SpatialTree } from '../../../models/utils/spatial-tree.js';
import type { ExerciseState } from '../../../state.js';
import { cloneDeepMutable } from '../../../utils/clone-deep.js';
import type { ElementTypePluralMap } from '../../../utils/element-type-plural-map.js';
import { elementTypePluralMap } from '../../../utils/element-type-plural-map.js';
import type { Mutable } from '../../../utils/immutability.js';
import type { UUID } from '../../../utils/uuid.js';
import { removeTreatmentsOfElement } from './calculate-treatments.js';
import { getElement } from './get-element.js';

/**
 * The element types for which a spatial tree exists in the state to improve the performance (see {@link SpatialTree}).
 * The position of the element must be changed via one of the function in this file.
 * In addition, the respective functions must be called when an element gets added or removed.
 */
export type SpatialElementType = 'material' | 'patient' | 'personnel';
type SpatialTypePluralMap = Pick<ElementTypePluralMap, SpatialElementType>;
export type SpatialElementPlural = SpatialTypePluralMap[SpatialElementType];

/**
 * Adds an element with a position and executes side effects to guarantee the consistency of the state.
 * Must be called if an element is added to the state
 */
export function addElementPosition(
    state: Mutable<ExerciseState>,
    elementType: SpatialElementType,
    elementId: UUID
) {
    const element = getElement(state, elementType, elementId);
    if (isNotOnMap(element)) {
        return;
    }
    SpatialTree.addElement(
        state.spatialTrees[elementTypePluralMap[elementType]],
        element.id,
        currentCoordinatesOf(element)
    );
}

/**
 * Changes the elements position and executes side effects to guarantee the consistency of the state
 */
export function updateElementPosition(
    state: Mutable<ExerciseState>,
    elementType: SpatialElementType,
    elementId: UUID,
    targetPosition: MapCoordinates
) {
    const element = getElement(state, elementType, elementId);
    if (isOnMap(element)) {
        const startPosition = cloneDeepMutable(currentCoordinatesOf(element));
        SpatialTree.moveElement(
            state.spatialTrees[elementTypePluralMap[elementType]],
            element.id,
            startPosition,
            targetPosition
        );
    } else {
        SpatialTree.addElement(
            state.spatialTrees[elementTypePluralMap[elementType]],
            element.id,
            targetPosition
        );
    }
}

/**
 * Removes the elements position and executes side effects to guarantee the consistency of the state
 * Must be called when an element is deleted from the state
 */
export function removeElementPosition(
    state: Mutable<ExerciseState>,
    elementType: SpatialElementType,
    elementId: UUID
) {
    const element = getElement(state, elementType, elementId);
    removeTreatmentsOfElement(state, element);
    if (isNotOnMap(element)) {
        return;
    }
    SpatialTree.removeElement(
        state.spatialTrees[elementTypePluralMap[elementType]],
        element.id,
        cloneDeepMutable(currentCoordinatesOf(element))
    );
}
