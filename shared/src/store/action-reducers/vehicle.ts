import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Material, Personnel, Vehicle } from '../../models';
import {
    currentCoordinatesOf,
    isInTransfer,
    isInVehicle,
    isNotOnMap,
    MapCoordinates,
    MapPosition,
    VehiclePosition,
} from '../../models/utils';
import {
    changePosition,
    changePositionWithId,
} from '../../models/utils/position/position-helpers-mutable';
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
import { completelyLoadVehicle as completelyLoadVehicleHelper } from './utils/completely-load-vehicle';
import { getElement } from './utils/get-element';
import { removeElementPosition } from './utils/spatial-elements';

export function deleteVehicle(
    draftState: Mutable<ExerciseState>,
    vehicleId: UUID
) {
    const vehicle = getElement(draftState, 'vehicle', vehicleId);
    // Delete related material and personnel
    Object.keys(vehicle.materialIds).forEach((materialId) => {
        removeElementPosition(draftState, 'material', materialId);
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
    @Type(() => MapCoordinates)
    public readonly targetPosition!: MapCoordinates;
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
        material: true,
        patient: true,
        personnel: true,
    })
    public readonly elementToBeLoadedType!:
        | 'material'
        | 'patient'
        | 'personnel';

    @IsUUID(4, uuidValidationOptions)
    public readonly elementToBeLoadedId!: UUID;
}

export class CompletelyLoadVehicleAction implements Action {
    @IsValue('[Vehicle] Completely load vehicle' as const)
    public readonly type = '[Vehicle] Completely load vehicle';
    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;
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
                changePosition(
                    material,
                    VehiclePosition.create(vehicle.id),
                    draftState
                );
                draftState.materials[material.id] = material;
            }
            for (const person of cloneDeepMutable(personnel)) {
                changePosition(
                    person,
                    VehiclePosition.create(vehicle.id),
                    draftState
                );
                draftState.personnel[person.id] = person;
            }
            return draftState;
        },
        rights: 'trainer',
    };

    export const moveVehicle: ActionReducer<MoveVehicleAction> = {
        action: MoveVehicleAction,
        reducer: (draftState, { vehicleId, targetPosition }) => {
            changePositionWithId(
                vehicleId,
                MapPosition.create(targetPosition),
                'vehicle',
                draftState
            );
            return draftState;
        },
        rights: 'participant',
    };

    export const renameVehicle: ActionReducer<RenameVehicleAction> = {
        action: RenameVehicleAction,
        reducer: (draftState, { vehicleId, name }) => {
            const vehicle = getElement(draftState, 'vehicle', vehicleId);
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
            const vehicle = getElement(draftState, 'vehicle', vehicleId);
            if (isNotOnMap(vehicle)) {
                throw new ReducerError(
                    `Vehicle with id ${vehicleId} is currently not on the map`
                );
            }
            const unloadPosition = currentCoordinatesOf(vehicle);
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
                changePositionWithId(
                    patientId,
                    MapPosition.create(
                        MapCoordinates.create(x, unloadPosition.y)
                    ),
                    'patient',
                    draftState
                );
                delete vehicle.patientIds[patientId];
            }

            for (const personnelId of personnelIds) {
                x += space;
                const personnel = getElement(
                    draftState,
                    'personnel',
                    personnelId
                );
                if (isInVehicle(personnel)) {
                    changePositionWithId(
                        personnelId,
                        MapPosition.create(
                            MapCoordinates.create(x, unloadPosition.y)
                        ),
                        'personnel',
                        draftState
                    );
                }
            }

            for (const materialId of materialIds) {
                x += space;
                const material = getElement(draftState, 'material', materialId);
                if (isInVehicle(material)) {
                    changePosition(
                        material,
                        MapPosition.create(
                            MapCoordinates.create(x, unloadPosition.y)
                        ),
                        draftState
                    );
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
            const vehicle = getElement(draftState, 'vehicle', vehicleId);
            switch (elementToBeLoadedType) {
                case 'material': {
                    const material = getElement(
                        draftState,
                        'material',
                        elementToBeLoadedId
                    );
                    if (!vehicle.materialIds[elementToBeLoadedId]) {
                        throw new ReducerError(
                            `Material with id ${material.id} is not assignable to the vehicle with id ${vehicle.id}`
                        );
                    }
                    changePosition(
                        material,
                        VehiclePosition.create(vehicleId),
                        draftState
                    );
                    break;
                }
                case 'personnel': {
                    const personnel = getElement(
                        draftState,
                        'personnel',
                        elementToBeLoadedId
                    );
                    if (isInTransfer(personnel)) {
                        throw new ReducerError(
                            `Personnel with id ${elementToBeLoadedId} is currently in transfer`
                        );
                    }
                    if (!vehicle.personnelIds[elementToBeLoadedId]) {
                        throw new ReducerError(
                            `Personnel with id ${personnel.id} is not assignable to the vehicle with id ${vehicle.id}`
                        );
                    }
                    changePosition(
                        personnel,
                        VehiclePosition.create(vehicleId),
                        draftState
                    );
                    break;
                }
                case 'patient': {
                    const patient = getElement(
                        draftState,
                        'patient',
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
                    changePosition(
                        patient,
                        VehiclePosition.create(vehicleId),
                        draftState
                    );

                    completelyLoadVehicleHelper(draftState, vehicle);
                }
            }
            return draftState;
        },
        rights: 'participant',
    };

    export const completelyLoadVehicle: ActionReducer<CompletelyLoadVehicleAction> =
        {
            action: CompletelyLoadVehicleAction,
            reducer: (draftState, { vehicleId }) => {
                const vehicle = getElement(draftState, 'vehicle', vehicleId);
                completelyLoadVehicleHelper(draftState, vehicle);

                return draftState;
            },
            rights: 'trainer',
        };
}
