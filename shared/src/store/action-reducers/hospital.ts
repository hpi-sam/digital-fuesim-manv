import { Type } from 'class-transformer';
import {
    IsNumber,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { Hospital } from '../../models';
import { HospitalPatient } from '../../models/hospital-patient';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { getElement } from './utils/get-element';
import { deleteVehicle } from './vehicle';

export class AddHospitalAction implements Action {
    @IsValue('[Hospital] Add hospital' as const)
    public readonly type = '[Hospital] Add hospital';
    @ValidateNested()
    @Type(() => Hospital)
    public readonly hospital!: Hospital;
}

export class EditTransportDurationToHospitalAction implements Action {
    @IsValue('[Hospital] Edit transportDuration to hospital' as const)
    public readonly type = '[Hospital] Edit transportDuration to hospital';
    @IsUUID(4, uuidValidationOptions)
    public readonly hospitalId!: UUID;

    @IsNumber()
    @Min(0)
    public readonly transportDuration!: number;
}

export class RenameHospitalAction implements Action {
    @IsValue('[Hospital] Rename hospital' as const)
    public readonly type = '[Hospital] Rename hospital';
    @IsUUID(4, uuidValidationOptions)
    public readonly hospitalId!: UUID;

    @IsString()
    public readonly name!: string;
}

export class RemoveHospitalAction implements Action {
    @IsValue('[Hospital] Remove hospital' as const)
    public readonly type = '[Hospital] Remove hospital';
    @IsUUID(4, uuidValidationOptions)
    public readonly hospitalId!: UUID;
}

export class TransportPatientToHospitalAction implements Action {
    @IsValue('[Hospital] Transport patient to hospital' as const)
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
            draftState.hospitals[hospital.id] = cloneDeepMutable(hospital);
            return draftState;
        },
        rights: 'trainer',
    };

    export const editTransportDurationToHospital: ActionReducer<EditTransportDurationToHospitalAction> =
        {
            action: EditTransportDurationToHospitalAction,
            reducer: (draftState, { hospitalId, transportDuration }) => {
                const hospital = getElement(draftState, 'hospital', hospitalId);
                hospital.transportDuration = transportDuration;
                return draftState;
            },
            rights: 'trainer',
        };

    export const renameHospital: ActionReducer<RenameHospitalAction> = {
        action: RenameHospitalAction,
        reducer: (draftState, { hospitalId, name }) => {
            const hospital = getElement(draftState, 'hospital', hospitalId);
            hospital.name = name;
            return draftState;
        },
        rights: 'trainer',
    };

    export const removeHospital: ActionReducer<RemoveHospitalAction> = {
        action: RemoveHospitalAction,
        reducer: (draftState, { hospitalId }) => {
            const hospital = getElement(draftState, 'hospital', hospitalId);
            // TODO: maybe make a hospital undeletable (if at least one patient is in it)
            for (const patientId of Object.keys(hospital.patientIds)) {
                delete draftState.hospitalPatients[patientId];
            }
            for (const transferPoint of Object.values(
                draftState.transferPoints
            )) {
                delete transferPoint.reachableHospitals[hospitalId];
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
                const hospital = getElement(draftState, 'hospital', hospitalId);
                const vehicle = getElement(draftState, 'vehicle', vehicleId);
                // TODO: Block vehicles whose material and personnel are unloaded
                for (const patientId of Object.keys(vehicle.patientIds)) {
                    const patient = getElement(
                        draftState,
                        'patient',
                        patientId
                    );
                    draftState.hospitalPatients[patientId] =
                        HospitalPatient.createFromPatient(
                            patient,
                            vehicle.vehicleType,
                            draftState.currentTime,
                            hospital.transportDuration + draftState.currentTime
                        );
                    hospital.patientIds[patientId] = true;
                }
                deleteVehicle(draftState, vehicleId);
                return draftState;
            },
            rights: 'participant',
        };
}
