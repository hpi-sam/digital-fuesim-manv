import { Type } from 'class-transformer';
import { IsBoolean, ValidateNested } from 'class-validator';
import { defaultTileMapProperties } from '../data';
import { getCreate, TileMapProperties } from './utils';

export class ExerciseConfiguration {
    @IsBoolean()
    public readonly pretriageEnabled: boolean = true;
    @IsBoolean()
    public readonly bluePatientsEnabled: boolean = false;

    @ValidateNested()
    @Type(() => TileMapProperties)
    public readonly tileMapProperties: TileMapProperties =
        defaultTileMapProperties;

    /**
     * @deprecated Use {@link create} instead
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor() {}

    static readonly create = getCreate(this);
}
