import {
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';
import type { AlarmGroupVehicle, VehicleTemplate } from '../../models';
import {
    AlarmGroupStartPoint,
    EocLogEntry,
    MapCoordinates,
} from '../../models';
import type { Mutable } from '../../utils';
import {
    StrictObject,
    UUID,
    cloneDeepMutable,
    uuidValidationOptions,
} from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import type { ExerciseState } from '../../state';
import { createVehicleParameters } from '../../state-helpers';
import { nextUUID } from '../../simulation/utils/randomness';
import { getElement } from './utils';
import { VehicleActionReducers } from './vehicle';
import { TransferActionReducers } from './transfer';
import { logAlarmGroupSent } from './utils/log';

export class AddLogEntryAction implements Action {
    @IsValue('[Emergency Operation Center] Add Log Entry' as const)
    public readonly type = '[Emergency Operation Center] Add Log Entry';
    @IsString()
    @MaxLength(255)
    public readonly name!: string;
    @IsString()
    @MaxLength(65535)
    public readonly message!: string;
}

export class SendAlarmGroupAction implements Action {
    @IsValue('[Emergency Operation Center] Send Alarm Group' as const)
    public readonly type = '[Emergency Operation Center] Send Alarm Group';

    @IsString()
    @MaxLength(255)
    public readonly clientName!: string;

    @IsUUID(4, uuidValidationOptions)
    public readonly alarmGroupId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly targetTransferPointId!: UUID;

    @IsInt()
    @Min(0)
    public readonly firstVehiclesCount!: number;

    @IsOptional()
    @IsUUID(4, uuidValidationOptions)
    public readonly firstVehiclesTargetTransferPointId: UUID | undefined;
}

export namespace EmergencyOperationCenterActionReducers {
    export const addLogEntry: ActionReducer<AddLogEntryAction> = {
        action: AddLogEntryAction,
        reducer: (draftState, { name, message }) => {
            const logEntry = EocLogEntry.create(
                draftState.currentTime,
                message,
                name
            );
            draftState.eocLog.push(cloneDeepMutable(logEntry));
            return draftState;
        },
        rights: 'trainer',
    };
    export const sendAlarmGroup: ActionReducer<SendAlarmGroupAction> = {
        action: SendAlarmGroupAction,
        reducer: (
            draftState,
            {
                clientName,
                alarmGroupId,
                targetTransferPointId,
                firstVehiclesCount,
                firstVehiclesTargetTransferPointId,
            }
        ) => {
            const alarmGroup = getElement(
                draftState,
                'alarmGroup',
                alarmGroupId
            );
            const vehicleTemplatesById = Object.fromEntries(
                draftState.vehicleTemplates.map((template) => [
                    template.id,
                    template,
                ])
            );

            const alarmGroupVehicles = StrictObject.values(
                alarmGroup.alarmGroupVehicles
            );

            const targetTransferPoint = getElement(
                draftState,
                'transferPoint',
                targetTransferPointId
            );
            let logEntry = `Alarmgruppe ${alarmGroup.name} wurde alarmiert zu ${targetTransferPoint.externalName}!`;

            if (firstVehiclesCount > 0 && firstVehiclesTargetTransferPointId) {
                const firstVehiclesTargetTransferPoint = getElement(
                    draftState,
                    'transferPoint',
                    firstVehiclesTargetTransferPointId
                );
                logEntry += ` Die ersten ${firstVehiclesCount} Fahrzeuge wurden zu ${firstVehiclesTargetTransferPoint.externalName} alarmiert!`;

                alarmGroupVehicles.sort((a, b) => a.time - b.time);
                for (
                    let i = 0;
                    alarmGroupVehicles.length > 0 && i < firstVehiclesCount;
                    i++
                ) {
                    sendAlarmGroupVehicle(
                        draftState,
                        alarmGroupVehicles.shift()!,
                        vehicleTemplatesById,
                        alarmGroup.id,
                        alarmGroup.name,
                        firstVehiclesTargetTransferPointId
                    );
                }
            }

            alarmGroupVehicles.forEach((alarmGroupVehicle) => {
                sendAlarmGroupVehicle(
                    draftState,
                    alarmGroupVehicle,
                    vehicleTemplatesById,
                    alarmGroup.id,
                    alarmGroup.name,
                    targetTransferPointId
                );
            });

            addLogEntry.reducer(draftState, {
                type: '[Emergency Operation Center] Add Log Entry',
                message: logEntry,
                name: clientName,
            });

            logAlarmGroupSent(draftState, alarmGroupId);

            return draftState;
        },
        rights: 'trainer',
    };
}

function sendAlarmGroupVehicle(
    draftState: Mutable<ExerciseState>,
    alarmGroupVehicle: Mutable<AlarmGroupVehicle>,
    vehicleTemplatesById: { [key in UUID]: VehicleTemplate },
    alarmGroupId: UUID,
    alarmGroupName: string,
    targetTransferPointId: UUID
) {
    const vehicleParameters = createVehicleParameters(
        nextUUID(draftState),
        {
            ...vehicleTemplatesById[alarmGroupVehicle.vehicleTemplateId]!,
            name: alarmGroupVehicle.name,
        },
        draftState.materialTemplates,
        draftState.personnelTemplates,
        // TODO: This position is not correct but needs to be provided.
        // Here one should use a Position with the Transfer.
        // But this is part of later Refactoring.
        // We need the Transfer to be created before the Vehicle is created,
        // else we need to provide a Position that is immediately overwritten by the Add to Transfer Action.
        // This is done here
        // Good Thing is, it is irrelevant, because the correctPosition is set immediately after this is called.
        MapCoordinates.create(0, 0)
    );

    VehicleActionReducers.addVehicle.reducer(draftState, {
        type: '[Vehicle] Add vehicle',
        vehicle: vehicleParameters.vehicle,
        materials: vehicleParameters.materials,
        personnel: vehicleParameters.personnel,
    });
    TransferActionReducers.addToTransfer.reducer(draftState, {
        type: '[Transfer] Add to transfer',
        elementType: vehicleParameters.vehicle.type,
        elementId: vehicleParameters.vehicle.id,
        startPoint: cloneDeepMutable(
            AlarmGroupStartPoint.create(alarmGroupId, alarmGroupVehicle.time)
        ),
        targetTransferPointId,
    });
}
