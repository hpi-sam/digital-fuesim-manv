import type {
    Position,
    ImageProperties,
    UUID,
} from 'digital-fuesim-manv-shared';
import { normalZoom } from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import type Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import type { ElementFeatureManager } from '../feature-managers/element-feature-manager';

type Constructor<T = any> = new (...args: any[]) => T;

export function withElementImageStyle<
    // It is necessary to specify this type explicitly,
    // because otherwise there are type errors if the Element is a superset
    // of { id: UUID, position: Position, image: ImageProperties }
    Element extends {
        id: UUID;
        position: Position;
        image: ImageProperties;
    },
    BaseType extends Constructor<ElementFeatureManager<Element>> = Constructor<
        ElementFeatureManager<Element>
    >
>(baseClass: BaseType) {
    return class WithElementImageStyle extends baseClass {
        /**
         * Whether vectorImages under {@link imageUrl} should be rasterized (provides a big performance boost, but lowers the quality of the image)
         */
        private readonly rasterizeVectorImages = false;

        /**
         * For performance reasons we share and reuse this style for each element with the same imageProperties
         * The key is JSON stringified {@link ImageProperties}
         */
        private readonly styleCache = new Map<string, Style>();

        /**
         *
         * @param feature The feature that should be styled with the image
         * @param currentZoom This is for some reason also called `resolution` in the ol typings
         * @returns The style that should be used for the feature
         */
        // This function should be as efficient as possible, because it is called per feature on each rendered frame
        public getStyle(feature: Feature<Point>, currentZoom: number) {
            const element = this.getElementFromFeature(feature)!.value;
            const key = JSON.stringify(element.image);
            if (!this.styleCache.has(key)) {
                this.styleCache.set(
                    key,
                    new Style({
                        image: new Icon({
                            src: element.image.url,
                            // this is a workaround to force openLayers to rasterize an svg image
                            // this gives a massive performance boost
                            // See https://github.com/openlayers/openlayers/issues/11133#issuecomment-638987210
                            color: this.rasterizeVectorImages
                                ? 'white'
                                : undefined,
                        }),
                    })
                );
            }
            const imageStyle = this.styleCache.get(key)!;
            const featureGeometry = feature.getGeometry()!;
            imageStyle.setGeometry(featureGeometry);
            const image = imageStyle.getImage();
            // Normalize the image size
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
