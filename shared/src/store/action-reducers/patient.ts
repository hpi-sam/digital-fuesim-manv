/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-namespace */
import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Patient } from '../../models';
import { Position } from '../../models/utils';
import { uuidValidationOptions, UUID, cloneDeepMutable } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { calculateTreatments } from './utils/calculate-treatments';

export class AddPatientAction implements Action {
    @IsString()
    public readonly type = '[Patient] Add patient';
    @ValidateNested()
    @Type(() => Patient)
    public readonly patient!: Patient;
}

export class MovePatientAction implements Action {
    @IsString()
    public readonly type = '[Patient] Move patient';

    @IsUUID(4, uuidValidationOptions)
    public readonly patientId!: UUID;

    @ValidateNested()
    @Type(() => Position)
    public readonly targetPosition!: Position;
}

export class RemovePatientAction implements Action {
    @IsString()
    public readonly type = '[Patient] Remove patient';
    @IsUUID(4, uuidValidationOptions)
    public readonly patientId!: UUID;
}

export namespace PatientActionReducers {
    export const addPatient: ActionReducer<AddPatientAction> = {
        action: AddPatientAction,
        reducer: (draftState, { patient }) => {
            if (
                Object.entries(patient.healthStates).some(
                    ([id, healthState]) => healthState.id !== id
                )
            ) {
                throw new ReducerError(
                    "Not all health state's ids match their key id"
                );
            }
            Object.values(patient.healthStates).forEach((healthState) => {
                healthState.nextStateConditions.forEach(
                    (nextStateCondition) => {
                        if (
                            patient.healthStates[
                                nextStateCondition.matchingHealthStateId
                            ] === undefined
                        ) {
                            throw new ReducerError(
                                `HealthState with id ${nextStateCondition.matchingHealthStateId} does not exist`
                            );
                        }
                    }
                );
            });
            if (
                patient.healthStates[patient.currentHealthStateId] === undefined
            ) {
                throw new ReducerError(
                    `HealthState with id ${patient.currentHealthStateId} does not exist`
                );
            }
            draftState.patients[patient.id] = cloneDeepMutable(patient);
            calculateTreatments(draftState);
            return draftState;
        },
        rights: 'trainer',
    };

    export const movePatient: ActionReducer<MovePatientAction> = {
        action: MovePatientAction,
        reducer: (draftState, { patientId, targetPosition }) => {
            const patient = draftState.patients[patientId];
            if (!patient) {
                throw new ReducerError(
                    `Patient with id ${patientId} does not exist`
                );
            }
            patient.position = targetPosition;
            calculateTreatments(draftState);
            return draftState;
        },
        rights: 'participant',
    };

    export const removePatient: ActionReducer<RemovePatientAction> = {
        action: RemovePatientAction,
        reducer: (draftState, { patientId }) => {
            if (!draftState.patients[patientId]) {
                throw new ReducerError(
                    `Patient with id ${patientId} does not exist`
                );
            }
            delete draftState.patients[patientId];
            calculateTreatments(draftState);
            return draftState;
        },
        rights: 'trainer',
    };
}
