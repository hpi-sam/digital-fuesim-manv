import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Hospital } from '../../models';
import { HospitalPatient } from '../../models/hospital-patient';
import { UUID, uuidValidationOptions } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
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

export class TransportPatientToHospitalAction implements Action {
    @IsString()
    public readonly type = '[Hospital] Transport patient to hospital';
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
            const hospital = getElement(draftState, 'hospitals', hospitalId);
            // TODO maybe make a hospital undeletable (if at least one patient is in it)
            for (const patientId of Object.keys(hospital.patientIds)) {
                delete draftState.hospitalPatients[patientId];
            }
            for (const transferPoint of Object.keys(
                draftState.transferPoints
            )) {
                delete draftState.transferPoints[transferPoint]
                    .reachableHospitals[hospitalId];
            }
            delete draftState.hospitals[hospitalId];
            return draftState;
        },
        rights: 'trainer',
    };

    export const transportPatientToHospital: ActionReducer<TransportPatientToHospitalAction> =
        {
            action: TransportPatientToHospitalAction,
            reducer: (draftState, { hospitalId, vehicleId }) => {
                const hospital = getElement(
                    draftState,
                    'hospitals',
                    hospitalId
                );
                const vehicle = getElement(draftState, 'vehicles', vehicleId);
                // TODO block vehicles without completely loaded (personnel and material gets deleted even outside the vehicle)
                for (const patientId of Object.keys(vehicle.patientIds)) {
                    const patient = getElement(
                        draftState,
                        'patients',
                        patientId
                    );
                    draftState.hospitalPatients[patientId] =
                        HospitalPatient.createFromPatient(
                            patient,
                            draftState.currentTime,
                            hospital.transportDuration + draftState.currentTime
                        );
                }
                deleteVehicle(draftState, vehicleId);
                calculateTreatments(draftState);
                return draftState;
            },
            rights: 'participant',
        };
}
