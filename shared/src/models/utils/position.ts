import { IsNumber } from 'class-validator';

export class Position {
    @IsNumber()
    public x: number;

    @IsNumber()
    public y: number;

    private constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static create(x: number, y: number) {
        return { ...new Position(x, y) };
    }
}
