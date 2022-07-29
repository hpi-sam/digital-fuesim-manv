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
import type { ExerciseState } from '../../state';
import type { Mutable } from '../../utils';
import { PatientUpdate } from '../../utils/patient-updates';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { letElementArrive } from './transfer';
import { calculateTreatments } from './utils/calculate-treatments';

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
                currentPatient.currentHealthStateName =
                    patientUpdate.nextStateName;
                currentPatient.stateTime = patientUpdate.nextStateTime;
                currentPatient.treatmentTime = patientUpdate.treatmentTime;
                if (currentPatient.treatmentHistory.length === 0) {
                    for (let i = 0; i <= (60 * 1000) / tickInterval; i++) {
                        currentPatient.treatmentHistory.push({
                            gf: 0,
                            material: 0,
                            notarzt: 0,
                            notSan: 0,
                            rettSan: 0,
                            san: 0,
                        });
                    }
                }
                currentPatient.treatmentHistory.shift();
                currentPatient.treatmentHistory.push(
                    patientUpdate.newTreatment
                );
            });
            // Refresh treatments
            if (refreshTreatments) {
                calculateTreatments(draftState);
            }
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
