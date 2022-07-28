import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Material, Personnel, Vehicle } from '../../models';
import { Position } from '../../models/utils';
import { DataStructureInState } from '../../models/utils/datastructure';
import type { ExerciseState } from '../../state';
import { imageSizeToPosition } from '../../state-helpers';
import type { Mutable, UUIDSet } from '../../utils';
import {
    cloneDeepMutable,
    StrictObject,
    UUID,
    uuidValidationOptions,
} from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { deletePatient } from './patient';
import { calculateTreatments } from './utils/calculate-treatments';
import { getElement } from './utils/get-element';

export function deleteVehicle(
    draftState: Mutable<ExerciseState>,
    vehicleId: UUID
) {
    // Check if the vehicle exists
    getElement(draftState, 'vehicles', vehicleId);
    // Delete related material and personnel
    Object.entries(draftState.materials)
        .filter(([, material]) => material.vehicleId === vehicleId)
        .forEach(([materialId]) => delete draftState.materials[materialId]);
    Object.entries(draftState.personnel)
        .filter(([, personnel]) => personnel.vehicleId === vehicleId)
        .forEach(([personnelId]) => delete draftState.personnel[personnelId]);
    Object.entries(draftState.patients)
        .filter(([, patients]) => patients.vehicleId === vehicleId)
        .forEach(([patientId]) => deletePatient(draftState, patientId));
    // Delete the vehicle
    delete draftState.vehicles[vehicleId];
}

export class AddVehicleAction implements Action {
    @IsString()
    public readonly type = '[Vehicle] Add vehicle';
    @ValidateNested()
    @Type(() => Vehicle)
    public readonly vehicle!: Vehicle;

    @IsArray()
    @ValidateNested()
    @Type(() => Material)
    public readonly materials!: readonly Material[];

    @IsArray()
    @ValidateNested()
    @Type(() => Personnel)
    public readonly personnel!: readonly Personnel[];
}

export class RenameVehicleAction implements Action {
    @IsString()
    public readonly type = '[Vehicle] Rename vehicle';
    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;

    @IsString()
    public readonly name!: string;
}

export class MoveVehicleAction implements Action {
    @IsString()
    public readonly type = '[Vehicle] Move vehicle';

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;

    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
}

export class RemoveVehicleAction implements Action {
    @IsString()
    public readonly type = '[Vehicle] Remove vehicle';
    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;
}

export class UnloadVehicleAction implements Action {
    @IsString()
    public readonly type = '[Vehicle] Unload vehicle';
    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;
}

export class LoadVehicleAction implements Action {
    @IsString()
    public readonly type = '[Vehicle] Load vehicle';

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;

    @IsString()
    public readonly elementToBeLoadedType!:
        | 'material'
        | 'patient'
        | 'personnel';

    @IsUUID(4, uuidValidationOptions)
    public readonly elementToBeLoadedId!: UUID;
}

export namespace VehicleActionReducers {
    export const addVehicle: ActionReducer<AddVehicleAction> = {
        action: AddVehicleAction,
        reducer: (draftState, { vehicle, materials, personnel }) => {
            if (
                materials.some(
                    (material) =>
                        material.vehicleId !== vehicle.id ||
                        vehicle.materialIds[material.id] === undefined
                ) ||
                StrictObject.keys(vehicle.materialIds).length !==
                    materials.length
            ) {
                throw new ReducerError(
                    'Vehicle material ids do not match material ids'
                );
            }
            if (
                personnel.some(
                    (currentPersonnel) =>
                        currentPersonnel.vehicleId !== vehicle.id ||
                        vehicle.personnelIds[currentPersonnel.id] === undefined
                ) ||
                StrictObject.keys(vehicle.personnelIds).length !==
                    personnel.length
            ) {
                throw new ReducerError(
                    'Vehicle personnel ids do not match personnel ids'
                );
            }
            draftState.vehicles[vehicle.id] = cloneDeepMutable(vehicle);
            for (const material of materials) {
                draftState.materials[material.id] = cloneDeepMutable(material);
            }
            for (const person of personnel) {
                draftState.personnel[person.id] = cloneDeepMutable(person);
            }
            return draftState;
        },
        rights: 'trainer',
    };

    export const moveVehicle: ActionReducer<MoveVehicleAction> = {
        action: MoveVehicleAction,
        reducer: (draftState, { vehicleId, targetPosition }) => {
            const vehicle = getElement(draftState, 'vehicles', vehicleId);
            vehicle.position = cloneDeepMutable(targetPosition);
            return draftState;
        },
        rights: 'participant',
    };

    export const renameVehicle: ActionReducer<RenameVehicleAction> = {
        action: RenameVehicleAction,
        reducer: (draftState, { vehicleId, name }) => {
            const vehicle = getElement(draftState, 'vehicles', vehicleId);
            vehicle.name = name;
            for (const personnelId of Object.keys(vehicle.personnelIds)) {
                draftState.personnel[personnelId]!.vehicleName = name;
            }
            for (const materialId of Object.keys(vehicle.materialIds)) {
                draftState.materials[materialId]!.vehicleName = name;
            }
            return draftState;
        },
        rights: 'trainer',
    };

    export const removeVehicle: ActionReducer<RemoveVehicleAction> = {
        action: RemoveVehicleAction,
        reducer: (draftState, { vehicleId }) => {
            deleteVehicle(draftState, vehicleId);
            return draftState;
        },
        rights: 'trainer',
    };

    export const unloadVehicle: ActionReducer<UnloadVehicleAction> = {
        action: UnloadVehicleAction,
        reducer: (draftState, { vehicleId }) => {
            const vehicle = getElement(draftState, 'vehicles', vehicleId);
            const unloadPosition = vehicle.position;
            if (!unloadPosition) {
                throw new ReducerError(
                    `Vehicle with id ${vehicleId} is currently in transfer`
                );
            }
            const materials = Object.keys(vehicle.materialIds).map(
                (materialId) => draftState.materials[materialId]!
            );
            const personnel = Object.keys(vehicle.personnelIds).map(
                (personnelId) => draftState.personnel[personnelId]!
            );
            const patients = Object.keys(vehicle.patientIds).map(
                (patientId) => draftState.patients[patientId]!
            );
            const vehicleWidthInPosition = imageSizeToPosition(
                vehicle.image.aspectRatio * vehicle.image.height
            );
            let patientsDataStructure =
                DataStructureInState.getDataStructureFromState(
                    draftState,
                    'patients'
                );
            let personnelDataStructure =
                DataStructureInState.getDataStructureFromState(
                    draftState,
                    'personnel'
                );
            let materialsDataStructure =
                DataStructureInState.getDataStructureFromState(
                    draftState,
                    'materials'
                );
            const space =
                vehicleWidthInPosition /
                (personnel.length + materials.length + patients.length + 1);
            let x = unloadPosition.x - vehicleWidthInPosition / 2;

            // first undload all patients, personnel and material and add them to their dataStructure

            for (const patient of patients) {
                x += space;
                patient.position ??= {
                    x,
                    y: unloadPosition.y,
                };
                delete vehicle.patientIds[patient.id];
                patientsDataStructure = DataStructureInState.addElement(
                    patientsDataStructure,
                    patient.id,
                    patient.position
                );
            }

            for (const person of personnel) {
                x += space;
                if (!Personnel.isInVehicle(person)) {
                    continue;
                }
                person.position ??= {
                    x,
                    y: unloadPosition.y,
                };
                personnelDataStructure = DataStructureInState.addElement(
                    personnelDataStructure,
                    person.id,
                    person.position
                );
            }

            for (const material of materials) {
                x += space;
                material.position ??= {
                    x,
                    y: unloadPosition.y,
                };
                materialsDataStructure = DataStructureInState.addElement(
                    materialsDataStructure,
                    material.id,
                    material.position
                );
            }

            // now that everything is unloaded the dataStructure we will calculate the treatment for them

            /**
             * has the Ids of every personnel and material that we calculated already, does not have to recalculated.
             * Without this set of skipped UUIDs all material and personnel around each patient that was unloaded would be calculated more again
             */
            const elementIdsToBeSkipped: Mutable<UUIDSet> = {};

            for (const person of personnel) {
                calculateTreatments(
                    draftState,
                    person,
                    person.position,
                    patientsDataStructure
                );
                elementIdsToBeSkipped[person.id] = true;
            }

            for (const material of materials) {
                calculateTreatments(
                    draftState,
                    material,
                    material.position,
                    patientsDataStructure
                );
                elementIdsToBeSkipped[material.id] = true;
            }

            for (const patient of patients) {
                calculateTreatments(
                    draftState,
                    patient,
                    patient.position,
                    patientsDataStructure,
                    personnelDataStructure,
                    materialsDataStructure,
                    elementIdsToBeSkipped
                );
            }

            // only if at least one patient was unloaded, we need to write this change into the dataStructure in state
            if (patients.length > 0) {
                DataStructureInState.writeDataStructureToState(
                    draftState,
                    'patients',
                    patientsDataStructure
                );
            }

            // only if at least one personnel was unloaded, we need to write this change into the dataStructure in state
            if (personnel.length > 0) {
                DataStructureInState.writeDataStructureToState(
                    draftState,
                    'personnel',
                    personnelDataStructure
                );
            }

            // only if at least one material was unloaded, we need to write this change into the dataStructure in state
            if (materials.length > 0) {
                DataStructureInState.writeDataStructureToState(
                    draftState,
                    'materials',
                    materialsDataStructure
                );
            }
            return draftState;
        },
        rights: 'participant',
    };

    export const loadVehicle: ActionReducer<LoadVehicleAction> = {
        action: LoadVehicleAction,
        reducer: (
            draftState,
            { vehicleId, elementToBeLoadedId, elementToBeLoadedType }
        ) => {
            const vehicle = getElement(draftState, 'vehicles', vehicleId);
            switch (elementToBeLoadedType) {
                case 'material': {
                    const material = getElement(
                        draftState,
                        'materials',
                        elementToBeLoadedId
                    );
                    if (!vehicle.materialIds[elementToBeLoadedId]) {
                        throw new ReducerError(
                            `Material with id ${material.id} is not assignable to the vehicle with id ${vehicle.id}`
                        );
                    }

                    if (material.position === undefined) {
                        throw new ReducerError(
                            `Material with id ${material.id} can't be loaded into vehicle with id ${vehicle.id}, as its position is undefined`
                        );
                    }

                    let materialsDataStructure =
                        DataStructureInState.getDataStructureFromState(
                            draftState,
                            'materials'
                        );
                    materialsDataStructure = DataStructureInState.removeElement(
                        materialsDataStructure,
                        material.id,
                        material.position
                    );
                    DataStructureInState.writeDataStructureToState(
                        draftState,
                        'materials',
                        materialsDataStructure
                    );

                    material.position = undefined;

                    // remove any treatments from this material
                    calculateTreatments(
                        draftState,
                        material,
                        material.position
                    );
                    break;
                }
                case 'personnel': {
                    const personnel = getElement(
                        draftState,
                        'personnel',
                        elementToBeLoadedId
                    );
                    if (personnel.transfer !== undefined) {
                        throw new ReducerError(
                            `Personnel with id ${elementToBeLoadedId} is currently in transfer`
                        );
                    }
                    if (!vehicle.personnelIds[elementToBeLoadedId]) {
                        throw new ReducerError(
                            `Personnel with id ${personnel.id} is not assignable to the vehicle with id ${vehicle.id}`
                        );
                    }

                    if (personnel.position === undefined) {
                        throw new ReducerError(
                            `Personnel with id ${personnel.id} can't be loaded into vehicle with id ${vehicle.id}, as its position is undefined, if personnel should be in transfer, something has gone wrong`
                        );
                    }

                    let personnelDataStructure =
                        DataStructureInState.getDataStructureFromState(
                            draftState,
                            'personnel'
                        );
                    personnelDataStructure = DataStructureInState.removeElement(
                        personnelDataStructure,
                        personnel.id,
                        personnel.position
                    );
                    DataStructureInState.writeDataStructureToState(
                        draftState,
                        'personnel',
                        personnelDataStructure
                    );

                    personnel.position = undefined;

                    // remove any treatments from this personnel
                    calculateTreatments(
                        draftState,
                        personnel,
                        personnel.position
                    );
                    break;
                }
                case 'patient': {
                    const patient = getElement(
                        draftState,
                        'patients',
                        elementToBeLoadedId
                    );
                    if (
                        Object.keys(vehicle.patientIds).length >=
                        vehicle.patientCapacity
                    ) {
                        throw new ReducerError(
                            `Vehicle with id ${vehicle.id} is already full`
                        );
                    }
                    vehicle.patientIds[elementToBeLoadedId] = true;
                    let patientsDataStructure =
                        DataStructureInState.getDataStructureFromState(
                            draftState,
                            'patients'
                        );

                    if (patient.position === undefined) {
                        throw new ReducerError(
                            `Patient with id ${patient.id} can't be loaded into vehicle with id ${vehicle.id}, as its position is undefined`
                        );
                    }

                    patientsDataStructure = DataStructureInState.removeElement(
                        patientsDataStructure,
                        patient.id,
                        patient.position
                    );
                    DataStructureInState.writeDataStructureToState(
                        draftState,
                        'patients',
                        patientsDataStructure
                    );

                    patient.position = undefined;

                    // remove any treatments this patient received
                    calculateTreatments(draftState, patient, patient.position);

                    const materialIds = Object.keys(vehicle.materialIds);
                    // if this vehicle has material associated with it load them in
                    if (materialIds.length > 0) {
                        let materialsDataStructure =
                            DataStructureInState.getDataStructureFromState(
                                draftState,
                                'materials'
                            );
                        for (const materialId of materialIds) {
                            const material = getElement(
                                draftState,
                                'materials',
                                materialId
                            );

                            if (material.position === undefined) {
                                throw new ReducerError(
                                    `Material with id ${material.id} can't be loaded into vehicle with id ${vehicle.id}, as its position is undefined`
                                );
                            }

                            materialsDataStructure =
                                DataStructureInState.removeElement(
                                    materialsDataStructure,
                                    material.id,
                                    material.position
                                );

                            material.position = undefined;

                            // remove any treatments from this material
                            calculateTreatments(
                                draftState,
                                material,
                                material.position
                            );
                        }
                        DataStructureInState.writeDataStructureToState(
                            draftState,
                            'materials',
                            materialsDataStructure
                        );
                    }

                    const personnelIds = Object.keys(vehicle.personnelIds);
                    // if this vehicle has personnel associated with it load all in (except personnel being in transfer)
                    if (personnelIds.length > 0) {
                        // TODO: right now the dataStructure would be read and written from the state, even when all personnel is in transfer
                        let personnelDataStructure =
                            DataStructureInState.getDataStructureFromState(
                                draftState,
                                'personnel'
                            );
                        for (const personnelId of personnelIds) {
                            const personnel = getElement(
                                draftState,
                                'personnel',
                                personnelId
                            );
                            // only load personnel from dataStructure if it had a position before and is not in transfer
                            if (
                                personnel.position !== undefined &&
                                personnel.transfer === undefined
                            ) {
                                personnelDataStructure =
                                    DataStructureInState.removeElement(
                                        personnelDataStructure,
                                        personnel.id,
                                        personnel.position
                                    );

                                personnel.position = undefined;

                                // remove any treatments from this material
                                calculateTreatments(
                                    draftState,
                                    personnel,
                                    personnel.position
                                );
                            }
                        }
                        DataStructureInState.writeDataStructureToState(
                            draftState,
                            'personnel',
                            personnelDataStructure
                        );
                    }
                }
            }

            return draftState;
        },
        rights: 'participant',
    };
}
