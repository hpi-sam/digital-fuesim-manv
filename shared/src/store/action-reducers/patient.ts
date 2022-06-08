import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Patient } from '../../models';
import { PatientStatus, Position } from '../../models/utils';
import type { ExerciseState } from '../../state';
import type { Mutable } from '../../utils';
import { uuidValidationOptions, UUID, cloneDeepMutable } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { calculateTreatments } from './utils/calculate-treatments';
import { getElement } from './utils/get-element';

export function deletePatient(
    draftState: Mutable<ExerciseState>,
    patientId: UUID
) {
    delete draftState.patients[patientId];
}

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

export class SetVisibleStatusAction implements Action {
    @IsString()
    public readonly type = '[Patient] Set Visible Status';

    @IsUUID(4, uuidValidationOptions)
    public readonly patientId!: UUID;

    @IsString()
    public readonly patientStatus!: PatientStatus;
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
            const patient = getElement(draftState, 'patients', patientId);
            patient.position = cloneDeepMutable(targetPosition);
            calculateTreatments(draftState);
            return draftState;
        },
        rights: 'participant',
    };

    export const removePatient: ActionReducer<RemovePatientAction> = {
        action: RemovePatientAction,
        reducer: (draftState, { patientId }) => {
            getElement(draftState, 'patients', patientId);
            deletePatient(draftState, patientId);
            calculateTreatments(draftState);
            return draftState;
        },
        rights: 'trainer',
    };

    export const setVisibleStatus: ActionReducer<SetVisibleStatusAction> = {
        action: SetVisibleStatusAction,
        reducer: (draftState, { patientId, patientStatus }) => {
            const patient = getElement(draftState, 'patients', patientId);
            patient.pretriageStatus = patientStatus;
            return draftState;
        },
        rights: 'participant',
    };
}
