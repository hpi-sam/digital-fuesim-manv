import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Material, Personnel, Vehicle } from '../../models';
import { Position } from '../../models/utils';
import { SpatialTree } from '../../models/utils/spatial-tree';
import type { ExerciseState } from '../../state';
import { imageSizeToPosition } from '../../state-helpers';
import type { Mutable } from '../../utils';
import {
    cloneDeepImmutable,
    cloneDeepMutable,
    StrictObject,
    UUID,
    uuidValidationOptions,
} from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { deletePatient } from './patient';
import { updateTreatments } from './utils/calculate-treatments';
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
        .forEach(([materialId]) => {
            const material = draftState.materials[materialId];
            if (material !== undefined) {
                if (material.position !== undefined) {
                    SpatialTree.removeElement(
                        draftState.spatialTrees.materials,
                        material.id,
                        material.position
                    );
                    delete material.position;
                }
                updateTreatments(draftState, material);
            }
            delete draftState.materials[materialId];
        });
    Object.entries(draftState.personnel)
        .filter(([, personnel]) => personnel.vehicleId === vehicleId)
        .forEach(([personnelId]) => {
            const personnel = draftState.personnel[personnelId];
            if (personnel !== undefined) {
                if (personnel.position !== undefined) {
                    SpatialTree.removeElement(
                        draftState.spatialTrees.personnel,
                        personnel.id,
                        personnel.position
                    );
                    delete personnel.position;
                }
                updateTreatments(draftState, personnel);
            }
            delete draftState.personnel[personnelId];
        });
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

            const space =
                vehicleWidthInPosition /
                (personnel.length + materials.length + patients.length + 1);
            let x = unloadPosition.x - vehicleWidthInPosition / 2;

            // first undload all patients, personnel and material and add them to their spatialTree

            for (const patient of patients) {
                x += space;
                patient.position ??= {
                    x,
                    y: unloadPosition.y,
                };
                delete vehicle.patientIds[patient.id];
                SpatialTree.addElement(
                    draftState.spatialTrees.patients,
                    patient.id,
                    cloneDeepImmutable(patient.position)
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
                SpatialTree.addElement(
                    draftState.spatialTrees.personnel,
                    person.id,
                    cloneDeepImmutable(person.position)
                );
            }

            for (const material of materials) {
                x += space;
                material.position ??= {
                    x,
                    y: unloadPosition.y,
                };
                SpatialTree.addElement(
                    draftState.spatialTrees.materials,
                    material.id,
                    cloneDeepImmutable(material.position)
                );
            }

            /**
             * Ids of elements that are already calculated
             */
            const elementIdsToBeSkipped = new Set<UUID>();

            // after every elements are unloaded we will calculate treatments for each
            for (const person of personnel) {
                updateTreatments(draftState, person);
                elementIdsToBeSkipped.add(person.id);
            }

            for (const material of materials) {
                updateTreatments(draftState, material);
                elementIdsToBeSkipped.add(material.id);
            }

            for (const patient of patients) {
                updateTreatments(draftState, patient, elementIdsToBeSkipped);
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

                    if (material.position !== undefined) {
                        SpatialTree.removeElement(
                            draftState.spatialTrees.materials,
                            material.id,
                            material.position
                        );
                    }

                    delete material.position;

                    // remove any treatments from this material
                    updateTreatments(draftState, material);
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

                    if (personnel.position !== undefined) {
                        SpatialTree.removeElement(
                            draftState.spatialTrees.personnel,
                            personnel.id,
                            personnel.position
                        );
                    }

                    delete personnel.position;

                    // remove any treatments from this personnel
                    updateTreatments(draftState, personnel);
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

                    if (patient.position !== undefined) {
                        SpatialTree.removeElement(
                            draftState.spatialTrees.patients,
                            patient.id,
                            patient.position
                        );
                    }

                    delete patient.position;

                    // remove any treatments this patient received
                    updateTreatments(draftState, patient);

                    // if this vehicle has material associated with it load them in
                    Object.keys(vehicle.materialIds).forEach((materialId) => {
                        const material = getElement(
                            draftState,
                            'materials',
                            materialId
                        );

                        if (material.position !== undefined) {
                            SpatialTree.removeElement(
                                draftState.spatialTrees.materials,
                                material.id,
                                material.position
                            );
                        }

                        delete material.position;

                        // remove any treatments from this material
                        updateTreatments(draftState, material);
                    });

                    // if this vehicle has personnel associated with it load all in (except personnel being in transfer)
                    Object.keys(vehicle.personnelIds).forEach((personnelId) => {
                        const personnel = getElement(
                            draftState,
                            'personnel',
                            personnelId
                        );
                        // only remove personnel from spatialTree if it had a position before and is not in transfer
                        if (
                            personnel.position !== undefined &&
                            personnel.transfer === undefined
                        ) {
                            SpatialTree.removeElement(
                                draftState.spatialTrees.personnel,
                                personnel.id,
                                personnel.position
                            );

                            delete personnel.position;

                            // remove any treatments from this material
                            updateTreatments(draftState, personnel);
                        }
                    });
                }
            }
            return draftState;
        },
        rights: 'participant',
    };
}
