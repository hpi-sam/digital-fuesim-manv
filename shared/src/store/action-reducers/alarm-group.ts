import { Type } from 'class-transformer';
import {
    IsNumber,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { AlarmGroup } from '../../models/alarm-group.js';
import { AlarmGroupVehicle } from '../../models/utils/alarm-group-vehicle.js';
import type { Mutable, UUID } from '../../utils/index.js';
import { cloneDeepMutable, uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import type { Action, ActionReducer } from '../action-reducer.js';
import { ReducerError } from '../reducer-error.js';
import { getElement } from './utils/get-element.js';

export class AddAlarmGroupAction implements Action {
    @IsValue('[AlarmGroup] Add AlarmGroup' as const)
    public readonly type = '[AlarmGroup] Add AlarmGroup';

    @ValidateNested()
    @Type(() => AlarmGroup)
    public readonly alarmGroup!: AlarmGroup;
}

export class RenameAlarmGroupAction implements Action {
    @IsValue('[AlarmGroup] Rename AlarmGroup' as const)
    public readonly type = '[AlarmGroup] Rename AlarmGroup';

    @IsUUID(4, uuidValidationOptions)
    public readonly alarmGroupId!: UUID;

    @IsString()
    public readonly name!: string;
}
export class RemoveAlarmGroupAction implements Action {
    @IsValue('[AlarmGroup] Remove AlarmGroup' as const)
    public readonly type = '[AlarmGroup] Remove AlarmGroup';

    @IsUUID(4, uuidValidationOptions)
    public readonly alarmGroupId!: UUID;
}
export class AddAlarmGroupVehicleAction implements Action {
    @IsValue('[AlarmGroup] Add AlarmGroupVehicle' as const)
    public readonly type = '[AlarmGroup] Add AlarmGroupVehicle';

    @IsUUID(4, uuidValidationOptions)
    public readonly alarmGroupId!: UUID;

    @ValidateNested()
    @Type(() => AlarmGroupVehicle)
    public readonly alarmGroupVehicle!: AlarmGroupVehicle;
}
export class EditAlarmGroupVehicleAction implements Action {
    @IsValue('[AlarmGroup] Edit AlarmGroupVehicle' as const)
    public readonly type = '[AlarmGroup] Edit AlarmGroupVehicle';

    @IsUUID(4, uuidValidationOptions)
    public readonly alarmGroupId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly alarmGroupVehicleId!: UUID;

    @IsNumber()
    @Min(0)
    public readonly time!: number;

    @IsString()
    public readonly name!: string;
}
export class RemoveAlarmGroupVehicleAction implements Action {
    @IsValue('[AlarmGroup] Remove AlarmGroupVehicle' as const)
    public readonly type = '[AlarmGroup] Remove AlarmGroupVehicle';

    @IsUUID(4, uuidValidationOptions)
    public readonly alarmGroupId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly alarmGroupVehicleId!: UUID;
}

export namespace AlarmGroupActionReducers {
    export const addAlarmGroup: ActionReducer<AddAlarmGroupAction> = {
        action: AddAlarmGroupAction,
        reducer: (draftState, { alarmGroup }) => {
            draftState.alarmGroups[alarmGroup.id] =
                cloneDeepMutable(alarmGroup);
            return draftState;
        },
        rights: 'trainer',
    };

    export const renameAlarmGroup: ActionReducer<RenameAlarmGroupAction> = {
        action: RenameAlarmGroupAction,
        reducer: (draftState, { alarmGroupId, name }) => {
            const alarmGroup = getElement(
                draftState,
                'alarmGroup',
                alarmGroupId
            );
            alarmGroup.name = name;
            return draftState;
        },
        rights: 'trainer',
    };

    export const removeAlarmGroup: ActionReducer<RemoveAlarmGroupAction> = {
        action: RemoveAlarmGroupAction,
        reducer: (draftState, { alarmGroupId }) => {
            getElement(draftState, 'alarmGroup', alarmGroupId);
            delete draftState.alarmGroups[alarmGroupId];
            return draftState;
        },
        rights: 'trainer',
    };

    export const addAlarmGroupVehicle: ActionReducer<AddAlarmGroupVehicleAction> =
        {
            action: AddAlarmGroupVehicleAction,
            reducer: (draftState, { alarmGroupId, alarmGroupVehicle }) => {
                const alarmGroup = getElement(
                    draftState,
                    'alarmGroup',
                    alarmGroupId
                );
                alarmGroup.alarmGroupVehicles[alarmGroupVehicle.id] =
                    cloneDeepMutable(alarmGroupVehicle);
                return draftState;
            },
            rights: 'trainer',
        };

    export const editAlarmGroupVehicle: ActionReducer<EditAlarmGroupVehicleAction> =
        {
            action: EditAlarmGroupVehicleAction,
            reducer: (
                draftState,
                { alarmGroupId, alarmGroupVehicleId, time, name }
            ) => {
                const alarmGroup = getElement(
                    draftState,
                    'alarmGroup',
                    alarmGroupId
                );
                const alarmGroupVehicle = getAlarmGroupVehicle(
                    alarmGroup,
                    alarmGroupVehicleId
                );
                alarmGroupVehicle.time = time;
                alarmGroupVehicle.name = name;
                return draftState;
            },
            rights: 'trainer',
        };

    export const removeAlarmGroupVehicle: ActionReducer<RemoveAlarmGroupVehicleAction> =
        {
            action: RemoveAlarmGroupVehicleAction,
            reducer: (draftState, { alarmGroupId, alarmGroupVehicleId }) => {
                const alarmGroup = getElement(
                    draftState,
                    'alarmGroup',
                    alarmGroupId
                );
                getAlarmGroupVehicle(alarmGroup, alarmGroupVehicleId);
                delete alarmGroup.alarmGroupVehicles[alarmGroupVehicleId];
                return draftState;
            },
            rights: 'trainer',
        };
}

function getAlarmGroupVehicle(
    alarmGroup: Mutable<AlarmGroup>,
    alarmGroupVehicleId: UUID
) {
    const alarmGroupVehicle =
        alarmGroup.alarmGroupVehicles[alarmGroupVehicleId];
    if (!alarmGroupVehicle) {
        throw new ReducerError(
            `AlarmGroupVehicle with id ${alarmGroupVehicleId} does not exist in AlarmGroup with id ${alarmGroup.id}`
        );
    }
    return alarmGroupVehicle;
}
