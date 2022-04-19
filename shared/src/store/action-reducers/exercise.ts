/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-namespace */

import { Type } from 'class-transformer';
import {
    IsString,
    IsInt,
    ValidateNested,
    IsBoolean,
    IsArray,
} from 'class-validator';
import { StatusHistoryEntry } from '../../models/status-history-entry';
import { getStatus } from '../../models/utils';
import { PatientUpdate } from '../../utils/patient-updates';
import type { Action, ActionReducer } from '../action-reducer';
import { calculateTreatments } from './utils/calculate-treatments';

export class PauseExerciseAction implements Action {
    @IsString()
    public readonly type = '[Exercise] Pause';
    @IsInt()
    public readonly timestamp!: number;
}

export class StartExerciseAction implements Action {
    @IsString()
    public readonly type = '[Exercise] Start';
    @IsInt()
    public readonly timestamp!: number;
}

export class ExerciseTickAction implements Action {
    @IsString()
    public readonly type = '[Exercise] Tick';

    @IsArray()
    @ValidateNested()
    @Type(() => PatientUpdate)
    public readonly patientUpdates!: readonly PatientUpdate[];

    @IsBoolean()
    public readonly refreshTreatments!: boolean;
}

export class SetParticipantIdAction implements Action {
    @IsString()
    public readonly type = `[Exercise] Set Participant Id`;
    @IsString()
    public readonly participantId!: string;
}

export namespace ExerciseActionReducers {
    export const pauseExercise: ActionReducer<PauseExerciseAction> = {
        action: PauseExerciseAction,
        reducer: (draftState, { timestamp }) => {
            const statusHistoryEntry = StatusHistoryEntry.create(
                'paused',
                new Date(timestamp)
            );
            draftState.statusHistory.push(statusHistoryEntry);
            return draftState;
        },
        rights: 'trainer',
    };

    export const startExercise: ActionReducer<StartExerciseAction> = {
        action: StartExerciseAction,
        reducer: (draftState, { timestamp }) => {
            const statusHistoryEntry = StatusHistoryEntry.create(
                'running',
                new Date(timestamp)
            );

            draftState.statusHistory.push(statusHistoryEntry);

            return draftState;
        },
        rights: 'trainer',
    };

    export const exerciseTick: ActionReducer<ExerciseTickAction> = {
        action: ExerciseTickAction,
        reducer: (draftState, { patientUpdates, refreshTreatments }) => {
            patientUpdates.forEach((patientUpdate) => {
                const currentPatient = draftState.patients[patientUpdate.id];
                currentPatient.currentHealthStateId = patientUpdate.nextStateId;
                currentPatient.health = patientUpdate.nextHealthPoints;
                currentPatient.stateTime = patientUpdate.nextStateTime;
                currentPatient.realStatus = getStatus(currentPatient.health);
                if (currentPatient.visibleStatus !== null) {
                    currentPatient.visibleStatus = currentPatient.realStatus;
                }
            });
            if (refreshTreatments) {
                calculateTreatments(draftState);
            }
            return draftState;
        },
        rights: 'server',
    };

    export const setParticipantId: ActionReducer<SetParticipantIdAction> = {
        action: SetParticipantIdAction,
        reducer: (draftState, { participantId }) => {
            draftState.participantId = participantId;
            return draftState;
        },
        rights: 'server',
    };
}
