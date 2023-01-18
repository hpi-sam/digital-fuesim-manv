import { IsNumber } from 'class-validator';
import { getCreate } from './get-create';

export class MapCoordinates {
    @IsNumber()
    public readonly x: number;

    @IsNumber()
    public readonly y: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static readonly create = getCreate(this);
}
