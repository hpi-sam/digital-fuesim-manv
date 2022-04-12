import { IsPositive } from 'class-validator';
import { getCreate } from './get-create';

export class Size {
    /**
     * The width in meters.
     */
    @IsPositive()
    public width: number;

    /**
     * The height in meters.
     */
    @IsPositive()
    public height: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    static readonly create = getCreate(this);
}
