import { IsPositive } from 'class-validator';

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

    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}
