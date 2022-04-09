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

    private constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    static create(width: number, height: number) {
        return { ...new Size(width, height) };
    }
}
