import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { TileMapProperties } from '../../models';
import type { Action, ActionReducer } from '../action-reducer';

export class SetTileMapPropertiesAction implements Action {
    @IsString()
    public readonly type = '[ExerciseSettings] Set tile map properties';

    @ValidateNested()
    @Type(() => TileMapProperties)
    public readonly tileMapProperties!: TileMapProperties;
}

export class SetPretriageFlagAction implements Action {
    @IsString()
    public readonly type = '[ExerciseSettings] Set Pretriage Flag';

    @IsBoolean()
    public readonly pretriageEnabled!: boolean;
}

export namespace ExerciseSettingsActionReducers {
    export const setTileMapProperties: ActionReducer<SetTileMapPropertiesAction> =
        {
            action: SetTileMapPropertiesAction,
            reducer: (draftState, { tileMapProperties }) => {
                draftState.tileMapProperties = tileMapProperties;
                return draftState;
            },
            rights: 'trainer',
        };

    export const setPretriageFlag: ActionReducer<SetPretriageFlagAction> = {
        action: SetPretriageFlagAction,
        reducer: (draftState, { pretriageEnabled }) => {
            draftState.configuration.pretriageEnabled = pretriageEnabled;
            return draftState;
        },
        rights: 'trainer',
    };
}
