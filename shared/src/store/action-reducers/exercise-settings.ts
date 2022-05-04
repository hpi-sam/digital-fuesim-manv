import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { TileMapProperties } from '../../models';
import type { Action, ActionReducer } from '../action-reducer';

export class SetTileMapPropertiesAction implements Action {
    @IsString()
    public readonly type = '[ExerciseSettings] Set tile map properties';

    @ValidateNested()
    @Type(() => TileMapProperties)
    public readonly tileMapProperties!: TileMapProperties;
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
}
