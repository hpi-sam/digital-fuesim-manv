import { IsInt, IsPositive, IsString } from 'class-validator';

export class ImageProperties {
    /**
     * A data URI or URL pointing to a local or remote image.
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
    @IsInt()
    @IsPositive()
    public height: number;

    /**
     * {@link aspectRatio} = width / {@link height}
     *
     * width = {@link aspectRatio} * {@link height}
     *
     * If the image is the same, their aspect ratios must be the same too.
     */
    @IsPositive()
    public aspectRatio: number;

    private constructor(url: string, height: number, aspectRatio: number) {
        this.url = url;
        this.height = height;
        this.aspectRatio = aspectRatio;
    }

    static create(url: string, height: number, aspectRatio: number) {
        return { ...new ImageProperties(url, height, aspectRatio) };
    }
}
