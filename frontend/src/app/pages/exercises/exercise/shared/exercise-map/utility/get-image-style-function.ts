import type { Feature } from 'ol';
import type Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';

/**
 * Helper class to style a feature with an image.
 *
 * The way this works in OpenLayers is that a Feature gets a style, that has an image.
 *
 */
export class ImageStyleHelper {
    public static readonly normalZoom = 23;

    constructor(
        /**
         * An url to the vector or raster image that should be used as the texture of a {@link Feature}
         */
        private readonly imageUrl: string,
        /**
         * The size in pixels that the longitude (y) image style of the feature should have at {@link normalZoom} zoom
         */
        private readonly normalizedImageHeight: number,
        /**
         * Whether vectorImages under {@link imageUrl} should be rasterized (provides a big performance boost, but lowers the quality of the image)
         */
        private readonly rasterizeVectorImages: boolean
    ) {}

    // for performance reasons we reuse this style for each feature
    private readonly imageStyle = new Style({
        image: new Icon({
            src: this.imageUrl,
            // this is a workaround to force openLayers to rasterize an svg image
            // this gives a massive performance boost
            // See https://github.com/openlayers/openlayers/issues/11133#issuecomment-638987210
            color: this.rasterizeVectorImages ? 'white' : undefined,
        }),
    });

    /**
     *
     * @param feature The feature that should be styled with the image
     * @param currentZoom This is for some reason also called `resolution` in the ol typings
     * @returns The style that should be used for the feature
     */
    // This function should be as efficient as possible, because it is called per feature on each rendered frame
    public getStyle(feature: Feature<Point>, currentZoom: number) {
        const featureGeometry = feature.getGeometry()!;
        this.imageStyle.setGeometry(featureGeometry);
        const image = this.imageStyle.getImage();
        // Normalize the image size
        const normalizedImageScale =
            this.normalizedImageHeight / (image.getImageSize()?.[1] ?? 1);
        const newScale =
            normalizedImageScale / (currentZoom * ImageStyleHelper.normalZoom);
        if (image.getScale() !== newScale) {
            // Make sure the image is always the same size on the map
            image.setScale(newScale);
        }
        return this.imageStyle;
    }
}
