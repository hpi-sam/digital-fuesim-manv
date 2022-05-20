import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsPositive,
    IsString,
    ValidateNested,
} from 'class-validator';
import { countBy } from 'lodash-es';
import type { Client, Patient, Vehicle } from '../../models';
import { Personnel, TransferPoint, Viewport } from '../../models';
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
            refreshTransfer(draftState, 'vehicles', tickInterval);
            refreshTransfer(draftState, 'personnel', tickInterval);
            // Update the statistics every ten ticks
            // TODO: Refactor this so that `refreshTreatments` is done the same way
            // TODO: Make this work with non-constant tickIntervals
            if (draftState.currentTime % (10 * tickInterval) === 0) {
                updateStatistics(draftState);
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
        Object.values(draftState.vehicles),
        Object.values(draftState.personnel)
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
                ),
                Object.values(draftState.personnel).filter(
                    (personnel) =>
                        personnel.position &&
                        Viewport.isInViewport(viewport, personnel.position)
                )
            ),
        ])
    );

    draftState.statistics.push({
        id: uuid(),
        exercise: exerciseStatistics,
        viewports: viewportStatistics,
        exerciseTime: draftState.currentTime,
    });
}

function generateAreaStatistics(
    clients: Client[],
    patients: Patient[],
    vehicles: Vehicle[],
    personnel: Personnel[]
): AreaStatistics {
    return {
        numberOfActiveParticipants: clients.filter(
            (client) => !client.isInWaitingRoom && client.role === 'participant'
        ).length,
        patients: countBy(patients, (patient) => patient.realStatus),
        vehicles: countBy(vehicles, (vehicle) => vehicle.vehicleType),
        personnel: countBy(
            personnel.filter(
                (_personnel) =>
                    !Personnel.isInVehicle(_personnel) &&
                    _personnel.transfer === undefined
            ),
            (_personnel) => _personnel.personnelType
        ),
    };
}
