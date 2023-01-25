import { isOnMap, Position } from '../../../models/utils';
import { MapPosition, isNotOnMap, coordinatesOf } from '../../../models/utils';
import { SpatialTree } from '../../../models/utils/spatial-tree';
import type { ExerciseState } from '../../../state';
import type { Mutable, UUID } from '../../../utils';
import { cloneDeepMutable } from '../../../utils';
import { updateTreatments } from './calculate-treatments';
import { getElement } from './get-element';

/**
 * The element types for which a spatial tree exists in the state to improve the performance (see {@link SpatialTree}).
 * The position of the element must be changed via one of the function in this file.
 * In addition, the respective functions must be called when an element gets added or removed.
 */
export type SpatialElementType = 'materials' | 'patients' | 'personnel';

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
        state.spatialTrees[elementType],
        element.id,
        coordinatesOf(element)
    );
    updateTreatments(state, element);
}

/**
 * Changes the elements position and executes side effects to guarantee the consistency of the state
 */
export function updateElementPosition(
    state: Mutable<ExerciseState>,
    elementType: SpatialElementType,
    elementId: UUID,
    targetPosition: Position
) {
    const element = getElement(state, elementType, elementId);
    if (isOnMap(element)) {
        const startPosition = cloneDeepMutable(coordinatesOf(element));
        SpatialTree.moveElement(
            state.spatialTrees[elementType],
            element.id,
            startPosition,
            targetPosition
        );
    } else {
        SpatialTree.addElement(
            state.spatialTrees[elementType],
            element.id,
            targetPosition
        );
    }
    element.metaPosition = cloneDeepMutable(MapPosition.create(targetPosition));
    updateTreatments(state, element);
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
    if (isNotOnMap(element)) {
        return;
    }
    SpatialTree.removeElement(
        state.spatialTrees[elementType],
        element.id,
        cloneDeepMutable(coordinatesOf(element))
    );
    updateTreatments(state, element);
}
