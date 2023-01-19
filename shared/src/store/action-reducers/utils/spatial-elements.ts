import type { Position } from '../../../models/utils';
import { SpatialTree } from '../../../models/utils/spatial-tree';
import type { ExerciseState } from '../../../state';
import type { Mutable, UUID } from '../../../utils';
import { cloneDeepMutable } from '../../../utils';
import { typeSelectorMap } from '../../../utils/type-state-selector-map';
import { updateTreatments } from './calculate-treatments';
import { getElement } from './get-element';

/**
 * The element types for which a spatial tree exists in the state to improve the performance (see {@link SpatialTree}).
 * The position of the element must be changed via one of the function in this file.
 * In addition, the respective functions must be called when an element gets added or removed.
 */
const spatialTypeSelectorMap = {
    material: typeSelectorMap.material,
    patient: typeSelectorMap.patient,
    personnel: typeSelectorMap.personnel,
} as const;
type SpatialTypeSelectorMap = typeof spatialTypeSelectorMap;
type SpatialElementType = keyof SpatialTypeSelectorMap;
export type SpatialElementSelector = SpatialTypeSelectorMap[SpatialElementType];

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
    if (element.position === undefined) {
        return;
    }
    SpatialTree.addElement(
        state.spatialTrees[spatialTypeSelectorMap[elementType]],
        element.id,
        element.position
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
    const startPosition = element.position;
    if (startPosition !== undefined) {
        SpatialTree.moveElement(
            state.spatialTrees[spatialTypeSelectorMap[elementType]],
            element.id,
            startPosition,
            targetPosition
        );
    } else {
        SpatialTree.addElement(
            state.spatialTrees[spatialTypeSelectorMap[elementType]],
            element.id,
            targetPosition
        );
    }
    element.position = cloneDeepMutable(targetPosition);
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
    if (element.position === undefined) {
        return;
    }
    SpatialTree.removeElement(
        state.spatialTrees[spatialTypeSelectorMap[elementType]],
        element.id,
        element.position
    );
    element.position = undefined;
    updateTreatments(state, element);
}
