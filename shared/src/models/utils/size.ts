import { IsNumber } from 'class-validator';

export class Size {
    /**
     * The width in meters.
     */
    @IsNumber()
    public width: number;

    /**
     * The height in meters.
     */
    @IsNumber()
    public height: number;

    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}
