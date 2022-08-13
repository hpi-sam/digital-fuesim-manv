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
import { ImmutableJsonObject } from '../../utils';
import type { Mutable, UUID } from '../../utils';
import type { Position } from '.';
import { getCreate } from '.';

/**
 * default nodeSize, important to be identitical for JSON import and export, see https://github.com/mourner/rbush#export-and-import
 */
export const nodeSize = 9;

/**
 * used as keys in spatialTrees in state
 * if a new type should be supported just include in here and in the state,
 * e.g. wanting to track all vehicles
 * (mind: for anything else than Points something different than PointRBush needs to be used)
 */
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
    /**
     * Only alter this via the functions in this class
     */
    @IsObject()
    public readonly spatialTreeAsJSON: ImmutableJsonObject;

    static readonly create = getCreate(this);

    /**
     * @deprecated Use {@link create} instead
     */
    constructor() {
        // initialize

        // just create an empty one, as bulk loading/insertion is not needed
        // if bulk loading/insertion is needed create new static function including this
        // https://github.com/mourner/rbush#bulk-inserting-data
        this.spatialTreeAsJSON = new PointRBush(
            nodeSize
        ).toJSON() as ImmutableJsonObject;
    }

    /**
     * gets the spatialTree with it creates a new PointRBush out of {@link spatialTreeAsJSON}
     *
     * * !!! IMPORTANT !!!
     * if you switch the spatialTree datastructure away from RBush be sure that export (write)
     * and import (read) are constant and not linear in performance (e.g. no stringify parse)
     * !!! IMPORTANT !!!
     *
     */
    private static getFromJSON(spatialTree: SpatialTree) {
        return new PointRBush(nodeSize).fromJSON(spatialTree.spatialTreeAsJSON);
    }

    /**
     * writes the spatialTree as a {@link ImmutableJsonObject} into {@link spatialTreeAsJSON}
     *
     * !!! IMPORTANT !!!
     * if you switch the spatialTree datastructure away from RBush be sure that export (write)
     * and import (read) are constant and not linear in performance (e.g. no stringify parse)
     * !!! IMPORTANT !!!
     */
    private static writeToJSON(
        spatialTree: Mutable<SpatialTree>,
        pointRBush: PointRBush
    ) {
        spatialTree.spatialTreeAsJSON = pointRBush.toJSON();
    }

    public static addElement(
        spatialTree: Mutable<SpatialTree>,
        elementId: UUID,
        position: Position
    ) {
        // after element is added (inserted) write spatialTree back into the state
        this.writeToJSON(
            spatialTree,
            // get spatialTree fromJSON and add (insert) Element
            this.getFromJSON(spatialTree).insert({
                position,
                id: elementId,
            })
        );
    }

    public static removeElement(
        spatialTree: Mutable<SpatialTree>,
        elementId: UUID,
        position: Position
    ) {
        // after element is removed write spatialTree back into the state
        this.writeToJSON(
            spatialTree,
            // get spatialTree fromJSON and remove Element
            this.getFromJSON(spatialTree).remove(
                {
                    position,
                    id: elementId,
                },
                (a, b) => a.id === b.id
            )
        );
    }

    public static moveElement(
        spatialTree: Mutable<SpatialTree>,
        elementId: UUID,
        startPosition: Position,
        targetPosition: Position
    ) {
        // TODO: use new move function from RBush, when available: https://github.com/mourner/rbush/issues/28
        this.removeElement(spatialTree, elementId, startPosition);
        this.addElement(spatialTree, elementId, targetPosition);
    }

    /**
     * @param position where around elements should be searched
     * @param radius around the {@link position}, must be >0
     *
     * @returns all or {@link maxNumberOfElements} elements in circle, result is sorted by distance
     */
    public static findAllElementsInCircle(
        spatialTree: Mutable<SpatialTree>,
        position: Position,
        radius: number
    ) {
        return radius > 0
            ? // find documentation to knn here: https://github.com/mourner/rbush-knn
              (knn(
                  this.getFromJSON(spatialTree),
                  position.x,
                  position.y,
                  undefined,
                  undefined,
                  radius
              ) as PointRBushElement[])
            : ([] as PointRBushElement[]);
    }

    /**
     * TODO: e.g. use it to get all elements of the saved type in a viewport
     * @param rectangleBorder.minPos left bottom corner of rectangle
     * @param rectangleBorder.maxPos right top corner of rectangle
     * rectangle could also be just a point
     *
     * @returns all elements in rectangle, but not by distance
     */
    public static findAllElementsInRectangle(
        spatialTree: Mutable<SpatialTree>,
        rectangleBorder: { minPos: Position; maxPos: Position }
    ) {
        return this.getFromJSON(spatialTree).search({
            minX: rectangleBorder.minPos.x,
            minY: rectangleBorder.minPos.y,
            maxX: rectangleBorder.maxPos.x,
            maxY: rectangleBorder.maxPos.y,
        });
    }
}
