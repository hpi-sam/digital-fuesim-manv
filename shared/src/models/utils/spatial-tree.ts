import { IsObject } from 'class-validator';
import RBush from 'rbush';
/**
 * right now knn is included via the github repo
 * when new release is coming out (right now npm package is v3.0.1)
 * could be switched to npm package in package.json and package-lock.json
 * https://github.com/mourner/rbush-knn#changelog
 */
// @ts-expect-error doesn't have a type
import knn from 'rbush-knn';
import type { ExerciseState } from '../../state';
import { ImmutableJsonObject } from '../../utils';
import type { Mutable, UUID } from '../../utils';
import type { Position } from '.';
import { getCreate } from '.';

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
    @IsObject()
    public readonly spatialTreeAsJSON: ImmutableJsonObject;

    static readonly create = getCreate(this);

    /**
     * @deprecated Use {@link create} instead
     */
    constructor() {
        // initialize

        /**
         * just create an empty one, as bulk loading/insertion is not needed
         * if bulk loading/insertion is needed create new static function including this
         * https://github.com/mourner/rbush#bulk-inserting-data
         */
        this.spatialTreeAsJSON = new PointRBush(
            nodeSize
        ).toJSON() as ImmutableJsonObject;
    }

    /**
     * gets the spatialTree from the state (where it is saved as {@link ImmutableJsonObject})
     * @param key of the spatialTree in spatialTrees
     *
     * * !!! IMPORTANT !!!
     * if you switch the spatialTree datastructure away from RBush be sure that export (write)
     * and import (read) are constant and not linear in performance (e.g. no stringify parse)
     * !!! IMPORTANT !!!
     *
     * TODO: discuss: call it readFromState or getFromState? does read imply non constant time?
     */
    static getFromState(state: ExerciseState, key: SpatialTreeElementType) {
        return new PointRBush(nodeSize).fromJSON(
            state.spatialTrees[key].spatialTreeAsJSON
        );
    }

    /**
     * writes the spatialTree into the state as {@link ImmutableJsonObject} and returns the state
     * @param key of the spatialTree in spatialTrees
     * @param spatialTree that should be saved to state (as JSON)
     *
     * !!! IMPORTANT !!!
     * if you switch the spatialTree datastructure away from RBush be sure that export (write)
     * and import (read) are constant and not linear in performance (e.g. no stringify parse)
     * !!! IMPORTANT !!!
     */
    static writeToState(
        state: Mutable<ExerciseState>,
        key: SpatialTreeElementType,
        spatialTree: PointRBush
    ) {
        state.spatialTrees[key].spatialTreeAsJSON =
            spatialTree.toJSON() as ImmutableJsonObject;
        return state;
    }

    /**
     *
     */
    static addElement(
        state: Mutable<ExerciseState>,
        key: SpatialTreeElementType,
        elementId: UUID,
        position: Position
    ) {
        // after element is added (inserted) write spatialTree back into the state
        return this.writeToState(
            state,
            key,
            // get spatialTree fromState and add (insert) Element
            this.getFromState(state, key).insert({
                position,
                id: elementId,
            })
        );
    }

    /**
     *
     */
    static removeElement(
        state: Mutable<ExerciseState>,
        key: SpatialTreeElementType,
        elementId: UUID,
        position: Position
    ) {
        // after element is removed write spatialTree back into the state
        return this.writeToState(
            state,
            key,
            // get spatialTree fromState and remove Element
            this.getFromState(state, key).remove(
                {
                    position,
                    id: elementId,
                },
                (a, b) => a.id === b.id
            )
        );
    }

    /**
     * @param positions [startPosition, targetPosition] of element to be moved inside the spatialTree
     */
    static moveElement(
        state: Mutable<ExerciseState>,
        key: SpatialTreeElementType,
        elementId: UUID,
        positions: [Position, Position]
    ) {
        // TODO: use new move function from RBush, when available: https://github.com/mourner/rbush/issues/28
        this.removeElement(state, key, elementId, positions[0]);
        return this.addElement(state, key, elementId, positions[1]);
    }

    /**
     *
     * @param position where around elements should be searched
     * @param radius around the {@link position}, must be >0
     *
     * @returns all or {@link maxNumberOfElements} elements in circle, result is sorted by distance
     */
    static findAllElementsInCircle(
        state: Mutable<ExerciseState>,
        key: SpatialTreeElementType,
        position: Position,
        radius: number
    ) {
        return radius > 0
            ? // find documentation to knn here: https://github.com/mourner/rbush-knn
              (knn(
                  this.getFromState(state, key),
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
        state: Mutable<ExerciseState>,
        key: SpatialTreeElementType,
        rectangleBorder: { minPos: Position; maxPos: Position }
    ) {
        return this.getFromState(state, key).search({
            minX: rectangleBorder.minPos.x,
            minY: rectangleBorder.minPos.y,
            maxX: rectangleBorder.maxPos.x,
            maxY: rectangleBorder.maxPos.y,
        });
    }
}
