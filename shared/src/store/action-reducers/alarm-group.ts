import { Type } from 'class-transformer';
import {
    IsNumber,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { AlarmGroup } from '../../models/alarm-group';
import { AlarmGroupVehicle } from '../../models/utils/alarm-group-vehicle';
import type { Mutable } from '../../utils';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { getElement } from './utils/get-element';

export class AddAlarmGroupAction implements Action {
    @IsString()
    public readonly type = '[AlarmGroup] Add AlarmGroup';

    @ValidateNested()
    @Type(() => AlarmGroup)
    public readonly alarmGroup!: AlarmGroup;
}

export class RenameAlarmGroupAction implements Action {
    @IsString()
    public readonly type = '[AlarmGroup] Rename AlarmGroup';

    @IsUUID(4, uuidValidationOptions)
    public readonly alarmGroupId!: UUID;

    @IsString()
    public readonly name!: string;
}
export class RemoveAlarmGroupAction implements Action {
    @IsString()
    public readonly type = '[AlarmGroup] Remove AlarmGroup';

    @IsUUID(4, uuidValidationOptions)
    public readonly alarmGroupId!: UUID;
}
export class AddAlarmGroupVehicleAction implements Action {
    @IsString()
    public readonly type = '[AlarmGroup] Add AlarmGroupVehicle';

    @IsUUID(4, uuidValidationOptions)
    public readonly alarmGroupId!: UUID;

    @ValidateNested()
    @Type(() => AlarmGroupVehicle)
    public readonly alarmGroupVehicle!: AlarmGroupVehicle;
}
export class EditAlarmGroupVehicleAction implements Action {
    @IsString()
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
    @IsString()
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
                'alarmGroups',
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
            getElement(draftState, 'alarmGroups', alarmGroupId);
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
                    'alarmGroups',
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
                    'alarmGroups',
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
                    'alarmGroups',
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
