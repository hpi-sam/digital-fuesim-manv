import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, Min, ValidateNested } from 'class-validator';
import { TileMapProperties } from '../../models/utils';
import { cloneDeepMutable } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';

export class SetTileMapPropertiesAction implements Action {
    @IsValue('[Configuration] Set tileMapProperties' as const)
    public readonly type = '[Configuration] Set tileMapProperties';

    @ValidateNested()
    @Type(() => TileMapProperties)
    public readonly tileMapProperties!: TileMapProperties;
}

export class SetPretriageEnabledAction implements Action {
    @IsValue('[Configuration] Set pretriageEnabled' as const)
    public readonly type = '[Configuration] Set pretriageEnabled';

    @IsBoolean()
    public readonly pretriageEnabled!: boolean;
}

export class SetBluePatientsEnabledFlagAction implements Action {
    @IsValue('[Configuration] Set bluePatientsEnabled' as const)
    public readonly type = '[Configuration] Set bluePatientsEnabled';

    @IsBoolean()
    public readonly bluePatientsEnabled!: boolean;
}

export class SetGlobalPatientChangeSpeedAction implements Action {
    @IsValue('[Configuration] Set globalPatientChangeSpeed')
    public readonly type = '[Configuration] Set globalPatientChangeSpeed';

    @IsNumber()
    @Min(0)
    public readonly changeSpeed!: number;
}

export namespace ConfigurationActionReducers {
    export const setTileMapProperties: ActionReducer<SetTileMapPropertiesAction> =
        {
            action: SetTileMapPropertiesAction,
            reducer: (draftState, { tileMapProperties }) => {
                draftState.configuration.tileMapProperties =
                    cloneDeepMutable(tileMapProperties);
                return draftState;
            },
            rights: 'trainer',
        };

    export const setPretriageFlag: ActionReducer<SetPretriageEnabledAction> = {
        action: SetPretriageEnabledAction,
        reducer: (draftState, { pretriageEnabled }) => {
            draftState.configuration.pretriageEnabled = pretriageEnabled;
            return draftState;
        },
        rights: 'trainer',
    };

    export const setBluePatientsFlag: ActionReducer<SetBluePatientsEnabledFlagAction> =
        {
            action: SetBluePatientsEnabledFlagAction,
            reducer: (draftState, { bluePatientsEnabled }) => {
                draftState.configuration.bluePatientsEnabled =
                    bluePatientsEnabled;
                return draftState;
            },
            rights: 'trainer',
        };

    export const setGlobalPatientChangeSpeed: ActionReducer<SetGlobalPatientChangeSpeedAction> =
        {
            action: SetGlobalPatientChangeSpeedAction,
            reducer: (draftState, { changeSpeed }) => {
                draftState.configuration.globalPatientChangeSpeed = changeSpeed;
                return draftState;
            },
            rights: 'trainer',
        };
}
