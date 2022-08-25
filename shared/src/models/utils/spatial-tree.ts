import { IsObject } from 'class-validator';
import RBush from 'rbush';
// Currently, knn is included via the github repo
// when  new release is coming out (right now npm package is v3.0.1)
// could be switched to npm package in package.json and package-lock.json
// https://github.com/mourner/rbush-knn#changelog
// @ts-expect-error doesn't have a type
import knn from 'rbush-knn';
import { ImmutableJsonObject } from '../../utils';
import type { Mutable, UUID } from '../../utils';
import type { Position } from '.';
import { getCreate } from '.';

/**
 * A data structure that enables efficient search of elements (interpreted as points) in a circle or rectangle
 * @see https://blog.mapbox.com/a-dive-into-spatial-search-algorithms-ebd0c5e39d2a
 */
export class SpatialTree {
    /**
     * If you change this, you have to add a state migration for it, else the rbush tree cannot be reconstructed
     * @see https://github.com/mourner/rbush#export-and-import
     */
    private static readonly rBushNodeSize = 9;

    /**
     * This must only be mutated by the static functions of this class
     */
    @IsObject()
    public readonly spatialTreeAsJSON: ImmutableJsonObject = new PointRBush(
        SpatialTree.rBushNodeSize
    ).toJSON();

    static readonly create = getCreate(this);

    /**
     * @deprecated Use {@link create} instead
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor() {}

    /**
     * @param spatialTree a JSON object
     * @returns a new {@link PointRBush} with all the methods to search, add etc. elements
     */
    private static getPointRBush(spatialTree: SpatialTree) {
        // PointRBush.fromJSON() runs in O(1)
        return new PointRBush(this.rBushNodeSize).fromJSON(
            spatialTree.spatialTreeAsJSON
        );
    }

    /**
     * Writes the spatialTree as an {@link ImmutableJsonObject} into {@link spatialTree}
     */
    private static savePointRBush(
        spatialTree: Mutable<SpatialTree>,
        pointRBush: PointRBush
    ) {
        // PointRBush.toJSON() runs in O(1)
        spatialTree.spatialTreeAsJSON = pointRBush.toJSON();
    }

    public static addElement(
        spatialTree: Mutable<SpatialTree>,
        elementId: UUID,
        position: Position
    ) {
        const pointRBush = this.getPointRBush(spatialTree);
        pointRBush.insert({
            position,
            id: elementId,
        });
        this.savePointRBush(spatialTree, pointRBush);
    }

    public static removeElement(
        spatialTree: Mutable<SpatialTree>,
        elementId: UUID,
        position: Mutable<Position> | Position
    ) {
        const pointRBush = this.getPointRBush(spatialTree);
        pointRBush.remove(
            {
                position,
                id: elementId,
            },
            (a, b) => a.id === b.id
        );
        this.savePointRBush(spatialTree, pointRBush);
    }

    public static moveElement(
        spatialTree: Mutable<SpatialTree>,
        elementId: UUID,
        startPosition: Mutable<Position> | Position,
        targetPosition: Position
    ) {
        // TODO: use the move function from RBush, when available: https://github.com/mourner/rbush/issues/28
        this.removeElement(spatialTree, elementId, startPosition);
        this.addElement(spatialTree, elementId, targetPosition);
    }

    /**
     * @param circlePosition the middle point of the search-circle
     * @param radius of the search-circle
     *
     * @returns the ids of the elements in the search-circle, sorted by distance to {@link circlePosition}
     */
    public static findAllElementsInCircle(
        spatialTree: Mutable<SpatialTree>,
        circlePosition: Mutable<Position> | Position,
        radius: number
    ): UUID[] {
        if (radius <= 0) {
            return [];
        }
        // knn implements a k-nearest neighbors search for RBush (https://github.com/mourner/rbush-knn)
        return knn(
            this.getPointRBush(spatialTree),
            circlePosition.x,
            circlePosition.y,
            undefined,
            undefined,
            radius
        ).map(({ id }: PointRBushElement) => id);
    }

    // TODO: Use this to get all elements in a viewport
    /**
     * @param rectangleBorder.minPos bottom left corner of rectangle
     * @param rectangleBorder.maxPos top right corner of rectangle
     * rectangle could also be just a point
     * @returns all elements in the rectangle in a non-specified order
     */
    public static findAllElementsInRectangle(
        spatialTree: Mutable<SpatialTree>,
        rectangleBorder: {
            minPos: Mutable<Position> | Position;
            maxPos: Mutable<Position> | Position;
        }
    ) {
        return this.getPointRBush(spatialTree).search({
            minX: rectangleBorder.minPos.x,
            minY: rectangleBorder.minPos.y,
            maxX: rectangleBorder.maxPos.x,
            maxY: rectangleBorder.maxPos.y,
        });
    }
}

/**
 * An element that is saved in the RBush
 * @param position of the element
 * @param id of the element
 */
interface PointRBushElement {
    position: Position;
    id: UUID;
}

/**
 * An RBush element that works with our Position format
 * @see https://github.com/mourner/rbush#data-format
 */
class PointRBush extends RBush<PointRBushElement> {
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
