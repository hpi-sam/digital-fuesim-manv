import { Type } from 'class-transformer';
import {
    IsArray,
    ValidateNested,
    IsBoolean,
    IsInt,
    IsPositive,
} from 'class-validator';
import { PartialExport } from '../../export-import/file-format';
import type { Personnel, Vehicle } from '../../models';
import { Patient } from '../../models';
import { getStatus } from '../../models/utils';
import type { ExerciseState } from '../../state';
import type { Mutable } from '../../utils';
import { cloneDeepMutable, uuid } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { letElementArrive } from './transfer';
import { PatientUpdate } from './utils';
import { updateTreatments } from './utils/calculate-treatments';

export class PauseExerciseAction implements Action {
    @IsValue('[Exercise] Pause' as const)
    public readonly type = '[Exercise] Pause';
}

export class StartExerciseAction implements Action {
    @IsValue('[Exercise] Start' as const)
    public readonly type = '[Exercise] Start';
}

export class ExerciseTickAction implements Action {
    @IsValue('[Exercise] Tick' as const)
    public readonly type = '[Exercise] Tick';

    @IsArray()
    @ValidateNested()
    @Type(() => PatientUpdate)
    public readonly patientUpdates!: readonly PatientUpdate[];

    /**
     * If true, it is updated which personnel and material treats which patient.
     * This shouldn't be done every tick, because else it could happen that personnel and material "jumps" too fast
     * between two patients. Keep in mind that the treatments are also updated e.g. if a patient/material/personnel etc.
     * is e.g. moved - completely independent from the ticks.
     * The performance optimization resulting from not refreshing the treatments every tick is probably very small in comparison
     * to skipping all patients that didn't change their status since the last treatment calculation
     * (via {@link Patient.visibleStatusChanged}).
     */
    @IsBoolean()
    public readonly refreshTreatments!: boolean;

    @IsInt()
    @IsPositive()
    public readonly tickInterval!: number;
}

export class ImportTemplatesAction implements Action {
    @IsValue('[Exercise] Import Templates' as const)
    public readonly type = '[Exercise] Import Templates';

    @IsLiteralUnion({ append: true, overwrite: true })
    public readonly mode!: 'append' | 'overwrite';

    @ValidateNested()
    @Type(() => PartialExport)
    public readonly partialExport!: PartialExport;
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
                // Save this to the state because the treatments aren't refreshed in every tick
                currentPatient.visibleStatusChanged =
                    visibleStatusBefore !== visibleStatusAfter;
                if (
                    refreshTreatments &&
                    // We only want to do this expensive calculation, when it is really necessary
                    currentPatient.visibleStatusChanged
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

    export const templateImport: ActionReducer<ImportTemplatesAction> = {
        action: ImportTemplatesAction,
        reducer: (draftState, { mode, partialExport }) => {
            const mutablePartialExport = cloneDeepMutable(partialExport);
            if (mutablePartialExport.mapImageTemplates !== undefined) {
                if (mode === 'append') {
                    draftState.mapImageTemplates.push(
                        ...mutablePartialExport.mapImageTemplates
                    );
                } else {
                    draftState.mapImageTemplates =
                        mutablePartialExport.mapImageTemplates;
                }
            }
            if (mutablePartialExport.patientCategories !== undefined) {
                if (mode === 'append') {
                    draftState.patientCategories.push(
                        ...mutablePartialExport.patientCategories
                    );
                } else {
                    draftState.patientCategories =
                        mutablePartialExport.patientCategories;
                }
            }
            if (mutablePartialExport.vehicleTemplates !== undefined) {
                if (mode === 'append') {
                    draftState.vehicleTemplates.push(
                        ...mutablePartialExport.vehicleTemplates
                    );
                } else {
                    // Remove all vehicles from all alarm groups as all existing vehicle templates are being removed
                    for (const alarmGroup of Object.values(
                        draftState.alarmGroups
                    )) {
                        alarmGroup.alarmGroupVehicles = {};
                    }
                    draftState.vehicleTemplates =
                        mutablePartialExport.vehicleTemplates;
                }
            }
            return draftState;
        },
        rights: 'trainer',
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

/**
 * Prepare a {@link PartialExport} for import.
 *
 * This includes resetting UUIDs as this cannot be done in the reducer.
 * @param partialExport The {@link PartialExport} to prepare.
 */
export function preparePartialExportForImport(
    partialExport: PartialExport
): PartialExport {
    const copy = cloneDeepMutable(partialExport);
    // `patientCategories` don't have an `id`
    const templateTypes = ['mapImageTemplates', 'vehicleTemplates'] as const;
    for (const templateType of templateTypes) {
        const templates = copy[templateType];
        if (templates !== undefined) {
            for (const template of templates) {
                template.id = uuid();
            }
        }
    }
    return copy;
}
