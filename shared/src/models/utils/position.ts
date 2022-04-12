import { IsNumber } from 'class-validator';
import { getCreate } from './get-create';

export class Position {
    @IsNumber()
    public x: number;

    @IsNumber()
    public y: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static readonly create = getCreate(this);
}
