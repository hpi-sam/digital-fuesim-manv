import { IsPositive, IsString } from 'class-validator';
import { getCreate } from './utils';

export class TileMapProperties {
    /**
     * The url to the server that serves the tiles. Must include {x}, {y} or {-y} and {z} placeholders.
     */
    @IsString()
    tileUrl: string;

    /**
     * The maximum {z} value the tile server accepts
     */
    @IsPositive()
    maxZoom: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(tileUrl: string, maxZoom: number) {
        this.tileUrl = tileUrl;
        this.maxZoom = maxZoom;
    }

    static readonly create = getCreate(this);
}
