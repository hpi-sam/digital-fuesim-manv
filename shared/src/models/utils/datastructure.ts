import { IsJSON, IsNumber, IsUUID } from 'class-validator';
import RBush from 'rbush';
// @ts-expect-error doesn't have a type
import knn from 'rbush-knn';
import type { ExerciseState } from '../../state';
import type { Position } from '../utils';
import { getCreate } from '../utils';
import type { Mutable } from '../../utils';
import {
    uuid,
    UUID,
    uuidValidationOptions,
    ImmutableJsonObject,
} from '../../utils';

/**
 * default nodeSize, important to be identitical for JSON import and export, see https://github.com/mourner/rbush#export-and-import
 */
export const nodeSize = 9;

// TODO: maybe use ElementType, see getElement<...
export type DataStructureElementType = 'materials' | 'patients' | 'personnel';

/**
 * @param position of element
 * @param id of element
 */
export interface DataStructureElement {
    position: Position;
    id: UUID;
}

export class MyRBush extends RBush<DataStructureElement> {
    toBBox(element: DataStructureElement) {
        return {
            minX: element.position.x,
            minY: element.position.y,
            maxX: element.position.x,
            maxY: element.position.y,
        };
    }
    compareMinX(a: DataStructureElement, b: DataStructureElement) {
        return a.position.x - b.position.x;
    }
    compareMinY(a: DataStructureElement, b: DataStructureElement) {
        return a.position.y - b.position.y;
    }
}

export class DataStructure {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsJSON()
    public readonly dataStructureAsJSON: ImmutableJsonObject;

    @IsNumber()
    static readonly create = getCreate(this);

    /**
     * @deprecated Use {@link create} instead
     */
    constructor() {
        // initialize

        // just create an empty one, as bulk loading/insertion is not needed
        this.dataStructureAsJSON = new MyRBush(
            nodeSize
        ).toJSON() as ImmutableJsonObject;
    }

    /**
     * gets the DataStructure from the state (where it is saved as JSON)
     * @param key of the dataStructure in dataStructures
     */
    static getDataStructureFromState(
        state: Mutable<ExerciseState>,
        key: DataStructureElementType
    ) {
        return new MyRBush(nodeSize).fromJSON(
            state.dataStructures[key].dataStructureAsJSON
        );
    }

    /**
     * writes the dataStructure into the state as JSON and returns the state
     * @param key of the dataStructure in dataStructures
     * @param dataStructure that should be saved to state (as JSON)
     */
    static writeDataStructureToState(
        state: Mutable<ExerciseState>,
        key: DataStructureElementType,
        dataStructure: MyRBush
    ) {
        state.dataStructures[key].dataStructureAsJSON =
            dataStructure.toJSON() as ImmutableJsonObject;
        return state;
    }

    /**
     *
     */
    static addElement(
        dataStructure: MyRBush,
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
        dataStructure: MyRBush,
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
        dataStructure: MyRBush,
        elementId: UUID,
        positions: [Position, Position]
    ) {
        // TODO: use new move function from RBush, when available: https://github.com/mourner/rbush/issues/28
        DataStructure.removeElement(dataStructure, elementId, positions[0]);
        DataStructure.addElement(dataStructure, elementId, positions[1]);

        return dataStructure;
    }

    /**
     *
     * @param position where around elements should be searched
     * @param radius around the {@link position}
     * @param maxNumberOfElements if undefined, it will return all elements
     *
     * @returns all or {@link maxNumberOfElements} if given elements in circle sorted by distance
     */
    static findAllElementsInCircle(
        dataStructure: MyRBush,
        position: Position,
        radius: number,
        maxNumberOfElements?: number
    ) {
        // if radius is negative, we will return nothing (empty array)
        // if radius is zero, only objects directly on top of it
        // using search instead of knn, as knn interprets zero as the same as infinite radius

        // TODO: maybe just treat zero as nothing can be found and return an empty array
        return radius < 0
            ? []
            : radius === 0
            ? dataStructure.search({
                  minX: position.x,
                  minY: position.y,
                  maxX: position.x,
                  maxY: position.y,
              })
            : (knn(
                  dataStructure,
                  position.x,
                  position.y,
                  maxNumberOfElements,
                  undefined,
                  radius
              ) as DataStructureElement[]);
    }

    /**
     *
     * @param rectangleBorder.minPos left bottom corner of rectangle
     * @param rectangleBorder.maxPos right top corner of rectangle
     *
     * @returns all elements in rectanlge, but not by distance
     */
    static findAllElementsInRectangle(
        dataStructure: MyRBush,
        rectangleBorder: { minPos: Position; maxPos: Position }
    ) {
        // if radius is negative, we will return nothing (empty array)
        // if radius is zero, only objects directly on top of it
        // using search instead of knn, as knn interprets zero as the same as infinite radius

        // TODO: maybe just treat zero as nothing can be found and return an empty array
        return dataStructure.search({
            minX: rectangleBorder.minPos.x,
            minY: rectangleBorder.minPos.y,
            maxX: rectangleBorder.maxPos.x,
            maxY: rectangleBorder.maxPos.y,
        });
    }
}
