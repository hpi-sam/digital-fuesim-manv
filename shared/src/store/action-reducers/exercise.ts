import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsPositive,
    IsString,
    ValidateNested,
} from 'class-validator';
import type { Personnel, Vehicle } from '../../models';
import { Patient } from '../../models';
import { getStatus } from '../../models/utils';
import type { ExerciseState } from '../../state';
import type { Mutable } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { letElementArrive } from './transfer';
import { updateTreatments } from './utils/calculate-treatments';
import { PatientUpdate } from './utils/patient-updates';

export class PauseExerciseAction implements Action {
    @IsString()
    public readonly type = '[Exercise] Pause';
}

export class StartExerciseAction implements Action {
    @IsString()
    public readonly type = '[Exercise] Start';
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

    @IsInt()
    @IsPositive()
    public readonly tickInterval!: number;
}

export namespace ExerciseActionReducers {
    export const pauseExercise: ActionReducer<PauseExerciseAction> = {
        action: PauseExerciseAction,
        reducer: (draftState) => {
            if (draftState.currentStatus !== 'running') {
                throw new ReducerError('Cannot pause not running exercise');
            }
            draftState.currentStatus = 'paused';
            return draftState;
        },
        rights: 'trainer',
    };

    export const startExercise: ActionReducer<StartExerciseAction> = {
        action: StartExerciseAction,
        reducer: (draftState) => {
            if (draftState.currentStatus === 'running') {
                throw new ReducerError('Cannot start already running exercise');
            }
            draftState.currentStatus = 'running';
            return draftState;
        },
        rights: 'trainer',
    };

    export const exerciseTick: ActionReducer<ExerciseTickAction> = {
        action: ExerciseTickAction,
        reducer: (
            draftState,
            { patientUpdates, refreshTreatments, tickInterval }
        ) => {
            // Refresh the current time
            draftState.currentTime += tickInterval;

            // Refresh patient status
            patientUpdates.forEach((patientUpdate) => {
                const currentPatient = draftState.patients[patientUpdate.id]!;

                const visibleStatusBefore = Patient.getVisibleStatus(
                    currentPatient,
                    draftState.configuration.pretriageEnabled,
                    draftState.configuration.bluePatientsEnabled
                );

                currentPatient.currentHealthStateId = patientUpdate.nextStateId;
                currentPatient.health = patientUpdate.nextHealthPoints;
                currentPatient.stateTime = patientUpdate.nextStateTime;
                currentPatient.treatmentTime = patientUpdate.treatmentTime;
                currentPatient.realStatus = getStatus(currentPatient.health);

                const visibleStatusAfter = Patient.getVisibleStatus(
                    currentPatient,
                    draftState.configuration.pretriageEnabled,
                    draftState.configuration.bluePatientsEnabled
                );

                if (
                    refreshTreatments &&
                    // We only want to do this expensive calculation, when it is really necessary
                    visibleStatusBefore !== visibleStatusAfter
                ) {
                    updateTreatments(draftState, currentPatient);
                }
            });

            // Refresh transfers
            refreshTransfer(draftState, 'vehicles', tickInterval);
            refreshTransfer(draftState, 'personnel', tickInterval);
            return draftState;
        },
        rights: 'server',
    };
}

function refreshTransfer(
    draftState: Mutable<ExerciseState>,
    key: 'personnel' | 'vehicles',
    tickInterval: number
): void {
    const elements = draftState[key];
    Object.values(elements).forEach((element: Mutable<Personnel | Vehicle>) => {
        if (!element.transfer) {
            return;
        }
        if (element.transfer.isPaused) {
            element.transfer.endTimeStamp += tickInterval;
            return;
        }
        // Not transferred yet
        if (element.transfer.endTimeStamp > draftState.currentTime) {
            return;
        }
        letElementArrive(draftState, key, element.id);
    });
}
