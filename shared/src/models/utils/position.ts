import { IsNumber } from 'class-validator';

export class Position {
    @IsNumber()
    public x: number;

    @IsNumber()
    public y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
