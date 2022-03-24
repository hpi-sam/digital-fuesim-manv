import { IsNumber, IsString } from 'class-validator';

export class ImageProperties {
    @IsString()
    public url: string;

    /**
     * The height of the image in pixels at the {@link normalZoom}
     */
    @IsNumber()
    public height: number;

    /**
     * {@link aspectRatio} = width / {@link height}
     *
     * width = {@link aspectRatio} * {@link height}
     */
    @IsNumber()
    public aspectRatio: number;

    public constructor(url: string, height: number, aspectRatio: number) {
        this.url = url;
        this.height = height;
        this.aspectRatio = aspectRatio;
    }
}
