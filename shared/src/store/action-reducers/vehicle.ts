import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Material, Personnel, Vehicle } from '../../models';
import { Position } from '../../models/utils';
import type { ExerciseState } from '../../state';
import { imageSizeToPosition } from '../../state-helpers';
import type { Mutable } from '../../utils';
import {
    cloneDeepMutable,
    StrictObject,
    UUID,
    uuidValidationOptions,
} from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { deletePatient } from './patient';
import { getElement } from './utils/get-element';
import {
    addElementPosition,
    removeElementPosition,
    updateElementPosition,
} from './utils/spatial-elements';

export function deleteVehicle(
    draftState: Mutable<ExerciseState>,
    vehicleId: UUID
) {
    const vehicle = getElement(draftState, 'vehicles', vehicleId);
    // Delete related material and personnel
    Object.keys(vehicle.materialIds).forEach((materialId) => {
        removeElementPosition(draftState, 'materials', materialId);
        delete draftState.materials[materialId];
    });
    Object.keys(vehicle.personnelIds).forEach((personnelId) => {
        removeElementPosition(draftState, 'personnel', personnelId);
        delete draftState.personnel[personnelId];
    });
    Object.keys(vehicle.patientIds).forEach((patientId) =>
        deletePatient(draftState, patientId)
    );
    // Delete the vehicle
    delete draftState.vehicles[vehicleId];
}

export class AddVehicleAction implements Action {
    @IsValue('[Vehicle] Add vehicle' as const)
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
    @IsValue('[Vehicle] Rename vehicle' as const)
    public readonly type = '[Vehicle] Rename vehicle';
    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;

    @IsString()
    public readonly name!: string;
}

export class MoveVehicleAction implements Action {
    @IsValue('[Vehicle] Move vehicle' as const)
    public readonly type = '[Vehicle] Move vehicle';

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;

    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
}

export class RemoveVehicleAction implements Action {
    @IsValue('[Vehicle] Remove vehicle' as const)
    public readonly type = '[Vehicle] Remove vehicle';
    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;
}

export class UnloadVehicleAction implements Action {
    @IsValue('[Vehicle] Unload vehicle' as const)
    public readonly type = '[Vehicle] Unload vehicle';
    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;
}

export class LoadVehicleAction implements Action {
    @IsValue('[Vehicle] Load vehicle' as const)
    public readonly type = '[Vehicle] Load vehicle';

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;

    @IsLiteralUnion({
        materials: true,
        patients: true,
        personnel: true,
    })
    public readonly elementToBeLoadedType!:
        | 'materials'
        | 'patients'
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
            for (const material of cloneDeepMutable(materials)) {
                material.metaPosition = {
                    type: 'vehicle',
                    vehicleId: vehicle.id,
                };
                draftState.materials[material.id] = material;
                addElementPosition(draftState, 'materials', material.id);
            }
            for (const person of cloneDeepMutable(personnel)) {
                person.metaPosition = {
                    type: 'vehicle',
                    vehicleId: vehicle.id,
                };
                draftState.personnel[person.id] = person;
                addElementPosition(draftState, 'personnel', person.id);
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
            vehicle.metaPosition = {
                type: 'coordinates',
                position: cloneDeepMutable(targetPosition),
            };
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
            const unloadMetaPosition = vehicle.metaPosition;
            if (unloadMetaPosition.type !== 'coordinates') {
                throw new ReducerError(
                    `Vehicle with id ${vehicleId} is currently not on the map`
                );
            }
            const unloadPosition = unloadMetaPosition.position;
            const materialIds = Object.keys(vehicle.materialIds);
            const personnelIds = Object.keys(vehicle.personnelIds);
            const patientIds = Object.keys(vehicle.patientIds);
            const vehicleWidthInPosition = imageSizeToPosition(
                vehicle.image.aspectRatio * vehicle.image.height
            );

            const space =
                vehicleWidthInPosition /
                (personnelIds.length +
                    materialIds.length +
                    patientIds.length +
                    1);
            let x = unloadPosition.x - vehicleWidthInPosition / 2;

            // Unload all patients, personnel and material and put them on the vehicle

            for (const patientId of patientIds) {
                x += space;
                updateElementPosition(draftState, 'patients', patientId, {
                    x,
                    y: unloadPosition.y,
                });
                delete vehicle.patientIds[patientId];
            }

            for (const personnelId of personnelIds) {
                x += space;
                const personnel = getElement(
                    draftState,
                    'personnel',
                    personnelId
                );
                if (Personnel.isInVehicle(personnel)) {
                    updateElementPosition(
                        draftState,
                        'personnel',
                        personnelId,
                        {
                            x,
                            y: unloadPosition.y,
                        }
                    );
                }
            }

            for (const materialId of materialIds) {
                x += space;
                const material = getElement(
                    draftState,
                    'materials',
                    materialId
                );
                if (Material.isInVehicle(material)) {
                    updateElementPosition(draftState, 'materials', materialId, {
                        x,
                        y: unloadPosition.y,
                    });
                }
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
                case 'materials': {
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
                    material.metaPosition = {
                        type: 'vehicle',
                        vehicleId,
                    };
                    removeElementPosition(draftState, 'materials', material.id);
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
                    personnel.metaPosition = {
                        type: 'vehicle',
                        vehicleId,
                    };
                    removeElementPosition(
                        draftState,
                        'personnel',
                        personnel.id
                    );
                    break;
                }
                case 'patients': {
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

                    patient.metaPosition = {
                        type: 'vehicle',
                        vehicleId,
                    };
                    removeElementPosition(draftState, 'patients', patient.id);

                    // Load in all materials
                    Object.keys(vehicle.materialIds).forEach((materialId) => {
                        getElement(
                            draftState,
                            'materials',
                            materialId
                        ).metaPosition = {
                            type: 'vehicle',
                            vehicleId,
                        };
                        removeElementPosition(
                            draftState,
                            'materials',
                            materialId
                        );
                    });

                    // Load in all personnel
                    Object.keys(vehicle.personnelIds)
                        .filter(
                            // Skip personnel currently in transfer
                            (personnelId) =>
                                getElement(draftState, 'personnel', personnelId)
                                    .transfer === undefined
                        )
                        .forEach((personnelId) => {
                            getElement(
                                draftState,
                                'personnel',
                                personnelId
                            ).metaPosition = {
                                type: 'vehicle',
                                vehicleId,
                            };
                            removeElementPosition(
                                draftState,
                                'personnel',
                                personnelId
                            );
                        });
                }
            }
            return draftState;
        },
        rights: 'participant',
    };
}
