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

export class DataStructure extends RBush<DataStructureElement> {
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

export class DataStructureInState {
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
        this.dataStructureAsJSON = new DataStructure(
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
        return new DataStructure(nodeSize).fromJSON(
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
        dataStructure: DataStructure
    ) {
        state.dataStructures[key].dataStructureAsJSON =
            dataStructure.toJSON() as ImmutableJsonObject;
        return state;
    }

    /**
     *
     */
    static addElement(
        dataStructure: DataStructure,
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
        dataStructure: DataStructure,
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
        dataStructure: DataStructure,
        elementId: UUID,
        positions: [Position, Position]
    ) {
        // TODO: use new move function from RBush, when available: https://github.com/mourner/rbush/issues/28
        DataStructureInState.removeElement(
            dataStructure,
            elementId,
            positions[0]
        );
        DataStructureInState.addElement(dataStructure, elementId, positions[1]);

        return dataStructure;
    }

    /**
     *
     * @param position where around elements should be searched
     * @param radius around the {@link position}, must be >0
     * @param maxNumberOfElements if undefined, it will return all elements
     *
     * @returns all or {@link maxNumberOfElements} if given elements in circle sorted by distance
     */
    static findAllElementsInCircle(
        dataStructure: DataStructure,
        position: Position,
        radius: number,
        maxNumberOfElements?: number
    ) {
        return radius > 0
            ? (knn(
                  dataStructure,
                  position.x,
                  position.y,
                  maxNumberOfElements,
                  undefined,
                  radius
              ) as DataStructureElement[])
            : ([] as DataStructureElement[]);
    }

    /**
     *
     * @param rectangleBorder.minPos left bottom corner of rectangle
     * @param rectangleBorder.maxPos right top corner of rectangle
     * rectangle could also be just a point
     *
     * @returns all elements in rectanlge, but not by distance
     */
    static findAllElementsInRectangle(
        dataStructure: DataStructure,
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
