import { Type } from 'class-transformer';
import {
    IsString,
    IsInt,
    ValidateNested,
    IsBoolean,
    IsArray,
    IsPositive,
} from 'class-validator';
import { countBy } from 'lodash-es';
import type { Client, Patient, Vehicle } from '../../models';
import { TransferPoint, Viewport } from '../../models';
import { StatusHistoryEntry } from '../../models/status-history-entry';
import { getStatus, Position } from '../../models/utils';
import type { AreaStatistics } from '../../models/utils/area-statistics';
import type { ExerciseState } from '../../state';
import { imageSizeToPosition } from '../../state-helpers';
import type { Mutable } from '../../utils';
import { uuid } from '../../utils';
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

    @IsInt()
    @IsPositive()
    public readonly tickInterval!: number;
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
        reducer: (
            draftState,
            { patientUpdates, refreshTreatments, tickInterval }
        ) => {
            // Refresh the current time
            draftState.currentTime += tickInterval;
            // Refresh patient status
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
            // Refresh treatments
            if (refreshTreatments) {
                calculateTreatments(draftState);
            }
            // Refresh transfers
            refreshTransfer(draftState, 'vehicles');
            refreshTransfer(draftState, 'personnel');

            // Update the statistics every ten seconds
            // if (draftState.currentTime % (10 * 1000) === 0) {
            updateStatistics(draftState);
            // }
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

function refreshTransfer(
    draftState: Mutable<ExerciseState>,
    key: 'personnel' | 'vehicles'
): void {
    const elements = draftState[key];
    Object.values(elements).forEach((element) => {
        if (
            !element.transfer ||
            // Not transferred yet
            element.transfer.endTimeStamp > draftState.currentTime
        ) {
            return;
        }
        // Personnel/Vehicle arrived at new transferPoint
        const targetTransferPoint =
            draftState.transferPoints[element.transfer.targetTransferPointId];
        element.position = Position.create(
            targetTransferPoint.position.x,
            targetTransferPoint.position.y +
                //  Position it in the upper half of the transferPoint)
                imageSizeToPosition(TransferPoint.image.height / 3)
        );
        delete element.transfer;
    });
}

function updateStatistics(draftState: Mutable<ExerciseState>): void {
    const exerciseStatistics = generateAreaStatistics(
        Object.values(draftState.clients),
        Object.values(draftState.patients),
        Object.values(draftState.vehicles)
    );

    const viewportStatistics = Object.fromEntries(
        Object.entries(draftState.viewports).map(([id, viewport]) => [
            id,
            generateAreaStatistics(
                Object.values(draftState.clients).filter(
                    (client) => client.viewRestrictedToViewportId === id
                ),
                Object.values(draftState.patients).filter(
                    (patient) =>
                        patient.position &&
                        Viewport.isInViewport(viewport, patient.position)
                ),
                Object.values(draftState.vehicles).filter(
                    (vehicle) =>
                        vehicle.position &&
                        Viewport.isInViewport(viewport, vehicle.position)
                )
            ),
        ])
    );

    draftState.statistics.push({
        id: uuid(),
        exercise: exerciseStatistics,
        viewports: viewportStatistics,
    });
}

function generateAreaStatistics(
    clients: Client[],
    patients: Patient[],
    vehicles: Vehicle[]
): AreaStatistics {
    return {
        numberOfActiveParticipants: clients.filter(
            (client) => !client.isInWaitingRoom && client.role === 'participant'
        ).length,
        patients: countBy(patients, (patient) => patient.realStatus),
        vehicles: countBy(vehicles, (vehicle) => vehicle.vehicleType),
    };
}
