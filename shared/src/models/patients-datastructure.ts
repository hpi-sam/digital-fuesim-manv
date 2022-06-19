import { IsJSON, IsNumber, IsUUID } from 'class-validator';
import RBush from 'rbush';
// @ts-expect-error doesn't have a type
import knn from 'rbush-knn';
import type { ExerciseState } from '../state';
import type { Mutable } from '../utils';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import type { Position } from './utils';
import { getCreate } from './utils';
import type { Patient } from '.';

// default nodeSize, important to be identitical for JSON import and export, see https://github.com/mourner/rbush#export-and-import
const nodeSize = 9;

/**
 * @param x x-coordinate of patient
 * @param y y-coordinate of patient
 * @param id PatientId
 */
interface PatientData {
    x: number;
    y: number;
    id: UUID;
}

export class MyRBush extends RBush<PatientData> {
    toBBox(d: PatientData) {
        return { minX: d.x, minY: d.y, maxX: d.x, maxY: d.y };
    }
    compareMinX(a: PatientData, b: PatientData) {
        return a.x - b.x;
    }
    compareMinY(a: Position, b: Position) {
        return a.y - b.y;
    }
}

export class PatientsDataStructure {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsJSON()
    public readonly dataStructureAsJSON: JSON;

    @IsNumber()
    static readonly create = getCreate(this);

    /**
     * @deprecated Use {@link create} instead
     */
    constructor() {
        // initialize

        // just create an empty one, as bulk loading/insertion is not needed right now
        this.dataStructureAsJSON = new MyRBush(nodeSize).toJSON();

        /**
         * if bulk loading/insertion is needed, use the code below
         * and include the following "state: Mutable<ExerciseState>, dataStructure: MyRBush" in constructor()
         */
        // const patients = Object.values(state.patients).filter(
        //     (patient) => patient.position !== undefined
        // );
        // const data: PatientData[] = [];
        // for (const patient of patients) {
        //     if (patient.position?.x && patient.position.y) {
        //         data.push({
        //             x: patient.position?.x,
        //             y: patient.position.y,
        //             id: patient.id,
        //         });
        //     }
        // }
        // this.dataStructureAsJSON = new MyRBush(nodeSize)
        //     .load(data)
        //     .toJSON();
    }

    // TODO: explain function and maybe better name
    /**
     * @param state
     * gets the DataStructure with functions from the dataStructureAsJSON object in the state
     */
    static getDataStructure(state: Mutable<ExerciseState>) {
        return new MyRBush().fromJSON(
            state.patientsDataStructure.dataStructureAsJSON
        );
    }

    // TODO: explain function and maybe better name
    /**
     * @param state
     * @param dataStructure
     * writes the dataStructure into the state as JSON and returns the state
     */
    static setDataStructure(
        state: Mutable<ExerciseState>,
        dataStructure: MyRBush
    ) {
        state.patientsDataStructure.dataStructureAsJSON =
            dataStructure.toJSON();
        return state;
    }

    /**
     * @param patient needs a patient with valid position
     */
    static addPatient(dataStructure: MyRBush, patient: Patient) {
        // TODO: check if patient got added sucessfully,
        // maybe lazy via length checking (something got added)
        if (patient.position?.x && patient.position.y) {
            dataStructure.insert({
                x: patient.position.x,
                y: patient.position.y,
                id: patient.id,
            });
            return dataStructure;
        }
        throw new TypeError('Expected patient to have a position');
    }

    /**
     * @param patient needs a patient with valid position
     */
    static removePatient(dataStructure: MyRBush, patient: Patient) {
        // TODO: check if patient got deleted sucessfully,
        // as function remove does nothing when datum does not exist in quadtree
        // maybe lazy via length checking (something got deleted)
        if (patient.position?.x && patient.position.y) {
            dataStructure.remove({
                x: patient.position.x,
                y: patient.position.y,
                id: patient.id,
            });
            return dataStructure;
        }
        throw new TypeError('Expected patient to have a position');
    }

    static movePatient(dataStructure: MyRBush, patient: Patient) {
        // TODO: check if patient got moved sucessfully
        if (patient.position?.x && patient.position.y) {
            // TODO: check if saving patient.position.x and .y in a const before is better for performance
            // TODO: check if first remove or first insert is better
            dataStructure.insert({
                x: patient.position.x,
                y: patient.position.y,
                id: patient.id,
            });
            dataStructure.remove({
                x: patient.position.x,
                y: patient.position.y,
                id: patient.id,
            });
            return dataStructure;
        }
        throw new TypeError('Expected patient to have a position');
    }

    static findAllPatientsInCircle(
        dataStructure: MyRBush,
        position: Position,
        radius: number
    ) {
        // TODO: check if knn does circle for maxDistance
        return knn(
            dataStructure,
            position.x,
            position.y,
            undefined,
            radius
        ) as PatientData[];
    }

    /**
     * NOTE:
     * when using a quadtree for personnel and material it could be possible to do the following:
     * when a patient changes his visualStatus it could be searched in the radius around the patient for every personnel/material
     * and recalculate the treatment only for them
     * doing this recursivly for every patient that a personnel/material switches through this process to another patient
     */
}
