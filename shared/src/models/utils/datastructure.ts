import { IsJSON } from 'class-validator';
import RBush from 'rbush';
// @ts-expect-error doesn't have a type
import knn from 'rbush-knn';
import type { ExerciseState } from '../../state';
import type { Position } from '../utils';
import { getCreate } from '../utils';
import type { Mutable, UUID } from '../../utils';
import { ImmutableJsonObject } from '../../utils';

/**
 * default nodeSize, important to be identitical for JSON import and export, see https://github.com/mourner/rbush#export-and-import
 */
export const nodeSize = 9;

// TODO: maybe use ElementType, see getElement<...
export type SpatialTreeElementType = 'materials' | 'patients' | 'personnel';

/**
 * @param position of element
 * @param id of element
 */
export interface PointRBushElement {
    position: Position;
    id: UUID;
}

/**
 * https://github.com/mourner/rbush#data-format
 */
export class PointRBush extends RBush<PointRBushElement> {
    toBBox(element: PointRBushElement) {
        return {
            minX: element.position.x,
            minY: element.position.y,
            maxX: element.position.x,
            maxY: element.position.y,
        };
    }
    compareMinX(a: PointRBushElement, b: PointRBushElement) {
        return a.position.x - b.position.x;
    }
    compareMinY(a: PointRBushElement, b: PointRBushElement) {
        return a.position.y - b.position.y;
    }
}

/**
 * efficient search of elements (points) in radius or rectangle
 * more info read: https://blog.mapbox.com/a-dive-into-spatial-search-algorithms-ebd0c5e39d2a
 */
export class SpatialTree {
    @IsJSON()
    public readonly spatialTreeAsJSON: ImmutableJsonObject;

    static readonly create = getCreate(this);

    /**
     * @deprecated Use {@link create} instead
     */
    constructor() {
        // initialize

        // just create an empty one, as bulk loading/insertion is not needed
        this.spatialTreeAsJSON = new PointRBush(
            nodeSize
        ).toJSON() as ImmutableJsonObject;
    }

    /**
     * gets the DataStructure from the state (where it is saved as JSON)
     * @param key of the dataStructure in dataStructures
     */
    static getFromState(state: ExerciseState, key: SpatialTreeElementType) {
        return new PointRBush(nodeSize).fromJSON(
            state.spatialTrees[key].spatialTreeAsJSON
        );
    }

    /**
     * writes the dataStructure into the state as JSON and returns the state
     * @param key of the dataStructure in dataStructures
     * @param dataStructure that should be saved to state (as JSON)
     */
    static writeToState(
        state: Mutable<ExerciseState>,
        key: SpatialTreeElementType,
        dataStructure: PointRBush
    ) {
        state.spatialTrees[key].spatialTreeAsJSON =
            dataStructure.toJSON() as ImmutableJsonObject;
        return state;
    }

    /**
     *
     */
    static addElement(
        dataStructure: PointRBush,
        elementId: UUID,
        position: Position
    ) {
        dataStructure.insert({
            position,
            id: elementId,
        });
        return dataStructure;
    }

    /**
     *
     */
    static removeElement(
        dataStructure: PointRBush,
        elementId: UUID,
        position: Position
    ) {
        dataStructure.remove(
            {
                position,
                id: elementId,
            },
            (a, b) => a.id === b.id
        );
        return dataStructure;
    }

    /**
     * @param positions [startPosition, targetPosition] of element to be moved inside the dataStructure
     */
    static moveElement(
        dataStructure: PointRBush,
        elementId: UUID,
        positions: [Position, Position]
    ) {
        // TODO: use new move function from RBush, when available: https://github.com/mourner/rbush/issues/28
        SpatialTree.removeElement(dataStructure, elementId, positions[0]);
        SpatialTree.addElement(dataStructure, elementId, positions[1]);

        return dataStructure;
    }

    /**
     *
     * @param position where around elements should be searched
     * @param radius around the {@link position}, must be >0
     *
     * @returns all or {@link maxNumberOfElements} if given elements in circle sorted by distance
     */
    static findAllElementsInCircle(
        dataStructure: PointRBush,
        position: Position,
        radius: number
    ) {
        return radius > 0
            ? (knn(
                  dataStructure,
                  position.x,
                  position.y,
                  undefined,
                  undefined,
                  radius
              ) as PointRBushElement[])
            : ([] as PointRBushElement[]);
    }

    // TODO: e.g. use it to get all elements of the saved type in a viewport
    /**
     *
     * @param rectangleBorder.minPos left bottom corner of rectangle
     * @param rectangleBorder.maxPos right top corner of rectangle
     * rectangle could also be just a point
     *
     * @returns all elements in rectangle, but not by distance
     */
    static findAllElementsInRectangle(
        dataStructure: PointRBush,
        rectangleBorder: { minPos: Position; maxPos: Position }
    ) {
        return dataStructure.search({
            minX: rectangleBorder.minPos.x,
            minY: rectangleBorder.minPos.y,
            maxX: rectangleBorder.maxPos.x,
            maxY: rectangleBorder.maxPos.y,
        });
    }
}
