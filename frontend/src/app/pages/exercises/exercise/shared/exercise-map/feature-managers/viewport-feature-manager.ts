import type { MapBrowserEvent } from 'ol';
import { Feature } from 'ol';
import LineString from 'ol/geom/LineString';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import type { Viewport } from 'src/app/shared/types/viewport';
import type { FeatureManager } from '../utility/feature-manager';
import { ElementManager } from './element-manager';

export class ViewportFeatureManager
    extends ElementManager<
        Viewport,
        Feature<LineString>,
        ReadonlySet<keyof Viewport>
    >
    implements FeatureManager<Feature<LineString>>
{
    readonly unsupportedChangeProperties = new Set(['id'] as const);

    constructor(public readonly layer: VectorLayer<VectorSource<LineString>>) {
        super();
    }

    private cachedStyle?: {
        currentZoom: number;
        style: Style;
    };

    /**
     *
     * @param feature The feature that should be styled
     * @param currentZoom This is for some reason also called `resolution` in the ol typings
     * @returns The style that should be used for the feature
     */
    // This function should be as efficient as possible, because it is called per feature on each rendered frame
    private getStyle(feature: Feature<LineString>, currentZoom: number) {
        if (this.cachedStyle?.currentZoom !== currentZoom) {
            this.cachedStyle = {
                currentZoom,
                style: new Style({
                    stroke: new Stroke({
                        color: 'fffafa',
                        width: 0.1 / currentZoom,
                    }),
                }),
            };
        }
        return this.cachedStyle.style;
    }

    createFeature(element: Viewport): void {
        const feature = new Feature(
            new LineString([
                [element.bottomLeftCornerPosition.x, element.bottomLeftCornerPosition.y],
                [element.bottomLeftCornerPosition.x, element.topRightCornerPosition.y],
                [element.topRightCornerPosition.x, element.topRightCornerPosition.y],
                [element.topRightCornerPosition.x, element.bottomLeftCornerPosition.y],
                [element.bottomLeftCornerPosition.x, element.bottomLeftCornerPosition.y],
            ])
        );
        feature.setStyle((thisFeature, currentZoom) =>
            this.getStyle(thisFeature as Feature<LineString>, currentZoom)
        );
        feature.setId(element.id);
        this.layer.getSource()!.addFeature(feature);
    }

    deleteFeature(
        element: Viewport,
        elementFeature: Feature<LineString>
    ): void {
        this.layer.getSource()!.removeFeature(elementFeature);
    }

    changeFeature(
        oldElement: Viewport,
        newElement: Viewport,
        changedProperties: ReadonlySet<keyof Viewport>,
        elementFeature: Feature<LineString>
    ): void {
        // Rendering the line again is expensive, so we only do it if we must
        if (
            changedProperties.has('bottomLeftCornerPosition') ||
            changedProperties.has('topRightCornerPosition')
        ) {
            elementFeature.getGeometry()!.setCoordinates([
                [newElement.bottomLeftCornerPosition.x, newElement.bottomLeftCornerPosition.y],
                [newElement.bottomLeftCornerPosition.x, newElement.topRightCornerPosition.y],
                [newElement.topRightCornerPosition.x, newElement.topRightCornerPosition.y],
                [newElement.topRightCornerPosition.x, newElement.bottomLeftCornerPosition.y],
                [newElement.bottomLeftCornerPosition.x, newElement.bottomLeftCornerPosition.y],
            ]);
        }
    }

    onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<LineString>
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) {}

    onFeatureDrop(
        dropEvent: TranslateEvent,
        droppedFeature: Feature<any>,
        droppedOnFeature: Feature<LineString>
    ) {
        return false;
    }

    getFeatureFromElement(element: Viewport) {
        return this.layer.getSource()!.getFeatureById(element.id) ?? undefined;
    }
}
