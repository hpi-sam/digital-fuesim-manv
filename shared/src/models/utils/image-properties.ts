import { IsNumber, IsString } from 'class-validator';

export class ImageProperties {
    /**
     * An url of a local file or a remote url that points to the image to be displayed.
     *
     * Supported image types are: jpg, jpeg, png, svg. (Others are not tested)
     * @example '/assets/image.svg'
     */
    @IsString()
    public url: string;

    /**
     * The height of the image in pixels at the {@link normalZoom}
     *
     * If there should be, e.g., children-patients and adult-patients they could share the same image, but with different heights.
     */
    @IsNumber()
    public height: number;

    /**
     * {@link aspectRatio} = width / {@link height}
     *
     * width = {@link aspectRatio} * {@link height}
     *
     * If the image is the same, their aspect ratios must be the same too.
     */
    @IsNumber()
    public aspectRatio: number;

    public constructor(url: string, height: number, aspectRatio: number) {
        this.url = url;
        this.height = height;
        this.aspectRatio = aspectRatio;
    }
}
