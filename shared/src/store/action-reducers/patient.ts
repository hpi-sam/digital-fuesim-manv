import { Type } from 'class-transformer';
import { IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Patient } from '../../models';
import {
    isOnMap,
    MapPosition,
    PatientStatus,
    patientStatusAllowedValues,
    MapCoordinates,
} from '../../models/utils';
import {
    changePosition,
    changePositionWithId,
} from '../../models/utils/position/position-helpers-mutable';
import type { ExerciseState } from '../../state';
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
import { updateTreatments } from './utils/calculate-treatments';
import { getElement } from './utils/get-element';
import { removeElementPosition } from './utils/spatial-elements';

export function deletePatient(
    draftState: Mutable<ExerciseState>,
    patientId: UUID
) {
    removeElementPosition(draftState, 'patient', patientId);
    delete draftState.patients[patientId];
}

export class AddPatientAction implements Action {
    @IsValue('[Patient] Add patient' as const)
    public readonly type = '[Patient] Add patient';
    @ValidateNested()
    @Type(() => Patient)
    public readonly patient!: Patient;
}

export class MovePatientAction implements Action {
    @IsValue('[Patient] Move patient' as const)
    public readonly type = '[Patient] Move patient';

    @IsUUID(4, uuidValidationOptions)
    public readonly patientId!: UUID;

    @ValidateNested()
    @Type(() => MapCoordinates)
    public readonly targetPosition!: MapCoordinates;
}

export class RemovePatientAction implements Action {
    @IsValue('[Patient] Remove patient' as const)
    public readonly type = '[Patient] Remove patient';
    @IsUUID(4, uuidValidationOptions)
    public readonly patientId!: UUID;
}

export class SetVisibleStatusAction implements Action {
    @IsValue('[Patient] Set Visible Status' as const)
    public readonly type = '[Patient] Set Visible Status';

    @IsUUID(4, uuidValidationOptions)
    public readonly patientId!: UUID;

    @IsLiteralUnion(patientStatusAllowedValues)
    public readonly patientStatus!: PatientStatus;
}

export class SetUserTextAction implements Action {
    @IsValue('[Patient] Set Remarks' as const)
    public readonly type = '[Patient] Set Remarks';

    @IsUUID(4, uuidValidationOptions)
    public readonly patientId!: UUID;

    @IsString()
    @MaxLength(65535)
    public readonly remarks!: string;
}

export namespace PatientActionReducers {
    export const addPatient: ActionReducer<AddPatientAction> = {
        action: AddPatientAction,
        reducer: (draftState, { patient }) => {
            if (
                StrictObject.entries(patient.healthStates).some(
                    ([id, healthState]) => healthState.id !== id
                )
            ) {
                throw new ReducerError(
                    "Not all health state's ids match their key id"
                );
            }
            StrictObject.values(patient.healthStates).forEach((healthState) => {
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
            const mutablePatient = cloneDeepMutable(patient);
            draftState.patients[mutablePatient.id] = mutablePatient;
            changePosition(mutablePatient, patient.position, draftState);
            return draftState;
        },
        rights: 'trainer',
    };

    export const movePatient: ActionReducer<MovePatientAction> = {
        action: MovePatientAction,
        reducer: (draftState, { patientId, targetPosition }) => {
            changePositionWithId(
                patientId,
                MapPosition.create(targetPosition),
                'patient',
                draftState
            );
            return draftState;
        },
        rights: 'participant',
    };

    export const removePatient: ActionReducer<RemovePatientAction> = {
        action: RemovePatientAction,
        reducer: (draftState, { patientId }) => {
            deletePatient(draftState, patientId);
            return draftState;
        },
        rights: 'trainer',
    };

    export const setVisibleStatus: ActionReducer<SetVisibleStatusAction> = {
        action: SetVisibleStatusAction,
        reducer: (draftState, { patientId, patientStatus }) => {
            const patient = getElement(draftState, 'patient', patientId);
            patient.pretriageStatus = patientStatus;

            if (isOnMap(patient)) {
                updateTreatments(draftState, patient);
            }

            return draftState;
        },
        rights: 'participant',
    };

    export const setUserTextAction: ActionReducer<SetUserTextAction> = {
        action: SetUserTextAction,
        reducer: (draftState, { patientId, remarks }) => {
            const patient = getElement(draftState, 'patient', patientId);
            patient.remarks = remarks;
            return draftState;
        },
        rights: 'participant',
    };
}
