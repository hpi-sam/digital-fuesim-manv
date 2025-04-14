import { IsNumber } from 'class-validator';
import { getCreate } from './get-create.js';

export class Size {
    /**
     * The width in meters.
     */
    @IsNumber()
    public readonly width: number;

    /**
     * The height in meters.
     */
    @IsNumber()
    public readonly height: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    static readonly create = getCreate(this);
}
