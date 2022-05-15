import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Hospital } from '../../models';
import { HospitalPatient } from '../../models/hospital-patient';
import { UUID, uuidValidationOptions } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { deleteVehicle } from './vehicle';
import { calculateTreatments } from './utils/calculate-treatments';
import { getElement } from './utils/get-element';

export class AddHospitalAction implements Action {
    @IsString()
    public readonly type = '[Hospital] Add hospital';
    @ValidateNested()
    @Type(() => Hospital)
    public readonly hospital!: Hospital;
}

export class RenameHospitalAction implements Action {
    @IsString()
    public readonly type = '[Hospital] Rename hospital';
    @IsUUID(4, uuidValidationOptions)
    public readonly hospitalId!: UUID;

    @IsString()
    public readonly name!: string;
}

export class RemoveHospitalAction implements Action {
    @IsString()
    public readonly type = '[Hospital] Remove hospital';
    @IsUUID(4, uuidValidationOptions)
    public readonly hospitalId!: UUID;
}

export class AddPatientToHospitalAction implements Action {
    @IsString()
    public readonly type = '[Hospital] Add patientToHospital';
    @IsUUID(4, uuidValidationOptions)
    public readonly hospitalId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId!: UUID;
}

export namespace HospitalActionReducers {
    export const addHospital: ActionReducer<AddHospitalAction> = {
        action: AddHospitalAction,
        reducer: (draftState, { hospital }) => {
            draftState.hospitals[hospital.id] = hospital;
            return draftState;
        },
        rights: 'trainer',
    };

    export const renameHospital: ActionReducer<RenameHospitalAction> = {
        action: RenameHospitalAction,
        reducer: (draftState, { hospitalId, name }) => {
            const hospital = getElement(draftState, 'hospitals', hospitalId);
            hospital.name = name;
            return draftState;
        },
        rights: 'trainer',
    };

    export const removeHospital: ActionReducer<RemoveHospitalAction> = {
        action: RemoveHospitalAction,
        reducer: (draftState, { hospitalId }) => {
            // Check if the Hospital exists
            getElement(draftState, 'hospitals', hospitalId);
            // TODO Delete related hospital patient or make a hospital undeletable (at all or when at leas one patient is in it)
            // Delete the Hospital
            delete draftState.hospitals[hospitalId];
            return draftState;
        },
        rights: 'trainer',
    };

    export const addPatientToHospital: ActionReducer<AddPatientToHospitalAction> =
        {
            action: AddPatientToHospitalAction,
            reducer: (draftState, { hospitalId, vehicleId }) => {
                const hospital = getElement(
                    draftState,
                    'hospitals',
                    hospitalId
                );
                const vehicle = getElement(draftState, 'vehicles', vehicleId);
                for (const patientId of Object.keys(vehicle.patientIds)) {
                    const patient = getElement(
                        draftState,
                        'patients',
                        patientId
                    );
                    HospitalPatient.create(
                        patientId,
                        draftState.currentTime,
                        hospital.transportDuration + draftState.currentTime,
                        patient.personalInformation,
                        patient.biometricInformation,
                        patient.visibleStatus,
                        patient.realStatus,
                        patient.healthStates,
                        patient.currentHealthStateId,
                        patient.image,
                        patient.health,
                        patient.healthDescription
                    );
                }
                deleteVehicle(draftState, vehicleId);
                calculateTreatments(draftState);
                return draftState;
            },
            rights: 'participant',
        };
}
