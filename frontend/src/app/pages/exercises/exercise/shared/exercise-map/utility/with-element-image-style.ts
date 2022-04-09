import type { ImageProperties, Constructor } from 'digital-fuesim-manv-shared';
import { normalZoom } from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import type Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import type {
    ElementFeatureManager,
    PositionableElement,
} from '../feature-managers/element-feature-manager';

/**
 * A mixin that styles the feature with the image of the element.
 * @param rasterizeVectorImages Whether vectorImages under {@link imageUrl} should be rasterized
 * (provides a big performance boost, but lowers the quality of the image)
 */
export function withElementImageStyle<
    // It is necessary to specify this type explicitly,
    // because otherwise there are type errors if the Element is a superset
    // of { id: UUID, position: Position, image: ImageProperties }
    Element extends PositionableElement & {
        image: ImageProperties;
    },
    BaseType extends Constructor<ElementFeatureManager<Element>> = Constructor<
        ElementFeatureManager<Element>
    >
>(baseClass: BaseType) {
    return class WithElementImageStyle extends baseClass {
        /**
         * For performance reasons we share and reuse this style for each element with the same imageProperties
         * The key is JSON stringified {@link ImageProperties}
         */
        // This cache is not expected to get very big, so we don't need to invalidate parts of it
        private readonly styleCache = new Map<string, Style>();
        /**
         * If the zoom is higher than this value vector images will be rasterized to improve performance
         */
        private readonly rasterizeZoomThreshold = 0.1;

        /**
         *
         * @param feature The feature that should be styled with the image
         * @param currentZoom This is for some reason also called `resolution` in the ol typings
         * @returns The style that should be used for the feature
         */
        // This function should be as efficient as possible, because it is called per feature on each rendered frame
        private getStyle(feature: Feature<Point>, currentZoom: number) {
            const rasterizeVectorImage =
                currentZoom > this.rasterizeZoomThreshold;
            const element = this.getElementFromFeature(feature)!.value;
            const key = JSON.stringify({
                image: element.image,
                rasterizeVectorImage,
            });
            if (!this.styleCache.has(key)) {
                this.styleCache.set(
                    key,
                    new Style({
                        image: new Icon({
                            src: element.image.url,
                            // this is a workaround to force openLayers to rasterize an svg image
                            // this gives a massive performance boost
                            // See https://github.com/openlayers/openlayers/issues/11133#issuecomment-638987210
                            color: rasterizeVectorImage ? 'white' : undefined,
                        }),
                    })
                );
            }
            const imageStyle = this.styleCache.get(key)!;
            const featureGeometry = feature.getGeometry()!;
            imageStyle.setGeometry(featureGeometry);
            const image = imageStyle.getImage();
            const normalizedImageScale =
                element.image.height / (image.getImageSize()?.[1] ?? 1);
            const newScale = normalizedImageScale / (currentZoom * normalZoom);
            if (image.getScale() !== newScale) {
                // Make sure the image is always the same size on the map
                image.setScale(newScale);
            }
            return imageStyle;
        }

        constructor(...args: any) {
            super(...args);
            this.layer.setStyle((feature, resolution) =>
                this.getStyle(feature as Feature<Point>, resolution)
            );
        }
    };
}
