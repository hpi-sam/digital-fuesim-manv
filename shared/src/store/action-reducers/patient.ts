import { Type } from 'class-transformer';
import { IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Patient } from '../../models';
import { PatientStatus, Position } from '../../models/utils';
import { SpatialTree } from '../../models/utils/spatial-tree';
import type { ExerciseState } from '../../state';
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
import { calculateTreatments } from './utils/calculate-treatments';
import { getElement } from './utils/get-element';

export function deletePatient(
    draftState: Mutable<ExerciseState>,
    patientId: UUID
) {
    const patient = draftState.patients[patientId];
    if (patient !== undefined) {
        if (patient.position !== undefined) {
            SpatialTree.removeElement(
                draftState.spatialTrees.patients,
                patient.id,
                patient.position
            );
            delete patient.position;
        }
        calculateTreatments(draftState, patient);
    }
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

export class SetUserTextAction implements Action {
    @IsString()
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
            draftState.patients[patient.id] = mutablePatient;

            if (patient.position !== undefined) {
                SpatialTree.addElement(
                    draftState.spatialTrees.patients,
                    patient.id,
                    patient.position
                );
            }

            calculateTreatments(draftState, mutablePatient);

            return draftState;
        },
        rights: 'trainer',
    };

    export const movePatient: ActionReducer<MovePatientAction> = {
        action: MovePatientAction,
        reducer: (draftState, { patientId, targetPosition }) => {
            const patient = getElement(draftState, 'patients', patientId);

            const startPosition = patient.position;

            if (startPosition !== undefined) {
                SpatialTree.moveElement(
                    draftState.spatialTrees.patients,
                    patient.id,
                    cloneDeepImmutable(startPosition),
                    targetPosition
                );
            } else {
                SpatialTree.addElement(
                    draftState.spatialTrees.patients,
                    patient.id,
                    targetPosition
                );
            }

            patient.position = cloneDeepMutable(targetPosition);

            calculateTreatments(draftState, patient);

            return draftState;
        },
        rights: 'participant',
    };

    export const removePatient: ActionReducer<RemovePatientAction> = {
        action: RemovePatientAction,
        reducer: (draftState, { patientId }) => {
            const patient = getElement(draftState, 'patients', patientId);

            if (patient.position !== undefined) {
                SpatialTree.removeElement(
                    draftState.spatialTrees.patients,
                    patient.id,
                    patient.position
                );

                delete patient.position;
                // remove any treatments this patient received (deletes patient from personnel and material assignedPatientIds UUIDSet)
                calculateTreatments(draftState, patient);
            }

            deletePatient(draftState, patientId);

            return draftState;
        },
        rights: 'trainer',
    };

    export const setVisibleStatus: ActionReducer<SetVisibleStatusAction> = {
        action: SetVisibleStatusAction,
        reducer: (draftState, { patientId, patientStatus }) => {
            const patient = getElement(draftState, 'patients', patientId);
            patient.pretriageStatus = patientStatus;

            if (patient.position !== undefined) {
                calculateTreatments(draftState, patient);
            }

            return draftState;
        },
        rights: 'participant',
    };

    export const setUserTextAction: ActionReducer<SetUserTextAction> = {
        action: SetUserTextAction,
        reducer: (draftState, { patientId, remarks }) => {
            const patient = getElement(draftState, 'patients', patientId);
            patient.remarks = remarks;
            return draftState;
        },
        rights: 'participant',
    };
}
