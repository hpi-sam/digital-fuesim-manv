import type { Feature } from 'ol';
import type Geometry from 'ol/geom/Geometry';
import type Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';

export class ImageStyleHelper {
    private static readonly normalZoom = 23;

    constructor(
        /**
         * An url to the vector or raster image that should be used as the texture a Feature
         */
        private readonly imageUrl: string,
        /**
         * The size in pixels that the longitude (y) image style of the feature should have at {@link normalZoom } zoom
         */
        private readonly normalizedImageHeight: number
    ) {}

    // for performance reasons we reuse this style for each feature
    private readonly imageStyle = new Style({
        image: new Icon({
            src: this.imageUrl,
        }),
    });

    // This function should be as efficient as possible, because it is called per feature on each rendered frame
    public getStyle(feature: Feature<Geometry>, resolution: number) {
        const featureGeometry = feature.getGeometry() as Point;
        this.imageStyle.setGeometry(featureGeometry);
        const image = this.imageStyle.getImage();
        // Normalize the image size
        const normalizedImageScale =
            this.normalizedImageHeight / (image.getImageSize()?.[1] ?? 1);
        const newScale =
            normalizedImageScale / (resolution * ImageStyleHelper.normalZoom);
        if (image.getScale() !== newScale) {
            // Make sure the image is always the same size on the map
            image.setScale(newScale);
        }
        return this.imageStyle;
    }
}
