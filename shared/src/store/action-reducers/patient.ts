import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Patient } from '../../models';
import { PatientStatus, Position } from '../../models/utils';
import { SpatialTree } from '../../models/utils/spatial-tree';
import type { ExerciseState } from '../../state';
import type { Mutable } from '../../utils';
import {
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
            draftState.patients[patient.id] = cloneDeepMutable(patient);

            if (patient.position === undefined) {
                throw new ReducerError(
                    `Patient with id ${patient.id} can't be added without a position`
                );
            }

            SpatialTree.addElement(
                draftState,
                'patients',
                patient.id,
                patient.position
            );
            calculateTreatments(draftState, patient, patient.position);

            return draftState;
        },
        rights: 'trainer',
    };

    export const movePatient: ActionReducer<MovePatientAction> = {
        action: MovePatientAction,
        reducer: (draftState, { patientId, targetPosition }) => {
            const patient = getElement(draftState, 'patients', patientId);

            const startPosition = patient.position;

            if (startPosition === undefined) {
                throw new ReducerError(
                    `Patient with id ${patient.id} can't be moved, as its position is undefined - needs a valid position to move from`
                );
            }

            patient.position = cloneDeepMutable(targetPosition);

            SpatialTree.moveElement(draftState, 'patients', patient.id, [
                startPosition,
                targetPosition,
            ]);

            calculateTreatments(draftState, patient, targetPosition);

            return draftState;
        },
        rights: 'participant',
    };

    export const removePatient: ActionReducer<RemovePatientAction> = {
        action: RemovePatientAction,
        reducer: (draftState, { patientId }) => {
            const patient = getElement(draftState, 'patients', patientId);

            if (patient.position === undefined) {
                throw new ReducerError(
                    `Patient with id ${patient.id} can't be removed, as its position is undefined, if removed while being inside a vehicle, something went wrong`
                );
            }

            SpatialTree.removeElement(
                draftState,
                'patients',
                patient.id,
                patient.position
            );

            patient.position = undefined;

            // remove any treatments this patient received (deletes patient from personnel and material assignedPatientIds UUIDSet)
            calculateTreatments(draftState, patient, patient.position);

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

            if (patient.position === undefined) {
                throw new ReducerError(
                    `visibleStatus of Patient with id ${patient.id} can't be set, as its position is undefined`
                );
            }

            calculateTreatments(draftState, patient, patient.position);

            return draftState;
        },
        rights: 'participant',
    };
}
