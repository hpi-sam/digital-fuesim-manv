/* eslint-disable require-unicode-regexp */
import { IsInt, IsPositive, IsUrl, Matches } from 'class-validator';
import { getCreate } from './get-create.js';

export class TileMapProperties {
    /**
     * The url to the server that serves the tiles. Must include {x}, {y} or {-y} and {z} placeholders.
     */
    @IsUrl()
    @Matches(/{x}/i)
    @Matches(/{(-)?y}/i)
    @Matches(/{z}/i)
    public readonly tileUrl: string;

    /**
     * The maximum {z} value the tile server accepts
     */
    @IsPositive()
    @IsInt()
    public readonly maxZoom: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(tileUrl: string, maxZoom: number) {
        this.tileUrl = tileUrl;
        this.maxZoom = maxZoom;
    }

    static readonly create = getCreate(this);
}
