/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-namespace */
import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Material, Personnel, Vehicle } from '../../models';
import { Position } from '../../models/utils';
import { imageSizeToPosition } from '../../state-helpers';
import { uuidValidationOptions, UUID } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { calculateTreatments } from './utils/calculate-treatments';

export class AddVehicleAction implements Action {
    @IsString()
    public readonly type = '[Vehicle] Add vehicle';
    @ValidateNested()
    @Type(() => Vehicle)
    public readonly vehicle!: Vehicle;

    @ValidateNested()
    @Type(() => Material)
    public readonly material!: Material;

    @IsArray()
    @ValidateNested()
    @Type(() => Personnel)
    public readonly personnel!: readonly Personnel[];
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
        reducer: (draftState, { vehicle, material, personnel }) => {
            draftState.vehicles[vehicle.id] = vehicle;
            draftState.materials[material.id] = material;
            for (const person of personnel) {
                draftState.personnel[person.id] = person;
            }
            return draftState;
        },
        rights: 'trainer',
    };

    export const moveVehicle: ActionReducer<MoveVehicleAction> = {
        action: MoveVehicleAction,
        reducer: (draftState, { vehicleId, targetPosition }) => {
            const vehicle = draftState.vehicles[vehicleId];
            if (!vehicle) {
                throw new ReducerError(
                    `Vehicle with id ${vehicleId} does not exist`
                );
            }
            vehicle.position = targetPosition;
            return draftState;
        },
        rights: 'participant',
    };

    export const removeVehicle: ActionReducer<RemoveVehicleAction> = {
        action: RemoveVehicleAction,
        reducer: (draftState, { vehicleId }) => {
            if (!draftState.vehicles[vehicleId]) {
                throw new ReducerError(
                    `Vehicle with id ${vehicleId} does not exist`
                );
            }
            delete draftState.vehicles[vehicleId];
            return draftState;
        },
        rights: 'trainer',
    };

    export const unloadVehicle: ActionReducer<UnloadVehicleAction> = {
        action: UnloadVehicleAction,
        reducer: (draftState, { vehicleId }) => {
            const vehicle = draftState.vehicles[vehicleId];
            if (!vehicle) {
                throw new ReducerError(
                    `Vehicle with id ${vehicleId} does not exist`
                );
            }
            const unloadPosition = vehicle.position;
            if (!unloadPosition) {
                throw new ReducerError(
                    `Vehicle with id ${vehicleId} is currently in transfer`
                );
            }
            const material = draftState.materials[vehicle.materialId];
            const personnel = Object.keys(vehicle.personnelIds).map(
                (personnelId) => draftState.personnel[personnelId]
            );
            const patients = Object.keys(vehicle.patientIds).map(
                (patientId) => draftState.patients[patientId]
            );
            const vehicleWidthInPosition = imageSizeToPosition(
                vehicle.image.aspectRatio * vehicle.image.height
            );
            const numberOfMaterial = 1;
            const space =
                vehicleWidthInPosition /
                (personnel.length + numberOfMaterial + patients.length + 1);
            let x = unloadPosition.x - vehicleWidthInPosition / 2;
            for (const patient of patients) {
                x += space;
                patient.position ??= {
                    x,
                    y: unloadPosition.y,
                };
                delete vehicle.patientIds[patient.id];
            }
            for (const person of personnel) {
                x += space;
                // TODO: only if the person is not in transfer
                person.position ??= {
                    x,
                    y: unloadPosition.y,
                };
            }
            x += space;
            material.position ??= {
                x,
                y: unloadPosition.y,
            };
            calculateTreatments(draftState);
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
            const vehicle = draftState.vehicles[vehicleId];
            if (!vehicle) {
                throw new ReducerError(
                    `Vehicle with id ${vehicleId} does not exist`
                );
            }
            switch (elementToBeLoadedType) {
                case 'material': {
                    const material = draftState.materials[elementToBeLoadedId];
                    if (!material) {
                        throw new ReducerError(
                            `Material with id ${elementToBeLoadedId} does not exist`
                        );
                    }
                    if (vehicle.materialId !== material.id) {
                        throw new ReducerError(
                            `Material with id ${material.id} is not assignable to the vehicle with id ${vehicle.id}`
                        );
                    }
                    material.position = undefined;
                    break;
                }
                case 'personnel': {
                    const personnel = draftState.personnel[elementToBeLoadedId];
                    if (!personnel) {
                        throw new ReducerError(
                            `Personnel with id ${elementToBeLoadedId} does not exist`
                        );
                    }
                    if (!vehicle.personnelIds[elementToBeLoadedId]) {
                        throw new ReducerError(
                            `Personnel with id ${personnel.id} is not assignable to the vehicle with id ${vehicle.id}`
                        );
                    }
                    personnel.position = undefined;
                    break;
                }
                case 'patient': {
                    const patient = draftState.patients[elementToBeLoadedId];
                    if (!patient) {
                        throw new ReducerError(
                            `Patient with id ${elementToBeLoadedId} does not exist`
                        );
                    }
                    if (
                        Object.keys(vehicle.patientIds).length >=
                        vehicle.patientCapacity
                    ) {
                        throw new ReducerError(
                            `Vehicle with id ${vehicle.id} is already full`
                        );
                    }
                    vehicle.patientIds[elementToBeLoadedId] = true;
                    patient.position = undefined;
                    draftState.materials[vehicle.materialId].position =
                        undefined;
                    Object.keys(vehicle.personnelIds).forEach((personnelId) => {
                        draftState.personnel[personnelId].position = undefined;
                    });
                }
            }
            calculateTreatments(draftState);
            return draftState;
        },
        rights: 'participant',
    };
}
