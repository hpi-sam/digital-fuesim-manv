import type { Viewport } from 'digital-fuesim-manv-shared/src/models/viewport';
import type { MapBrowserEvent } from 'ol';
import { Feature } from 'ol';
import LineString from 'ol/geom/LineString';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

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
                [element.topLeft.x, element.topLeft.y],
                [element.topLeft.x + element.size.width, element.topLeft.y],
                [element.topLeft.x + element.size.width, element.topLeft.y - element.size.height],
                [element.topLeft.x, element.topLeft.y - element.size.height],
                [element.topLeft.x, element.topLeft.y],
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
        // Rendering the lines again is expensive, so we only do it if we must
        if (
            changedProperties.has('topLeft') ||
            changedProperties.has('size')
        ) {
            elementFeature.getGeometry()!.setCoordinates([
                [newElement.topLeft.x, newElement.topLeft.y],
                [newElement.topLeft.x + newElement.size.width, newElement.topLeft.y],
                [newElement.topLeft.x + newElement.size.width, newElement.topLeft.y - newElement.size.height],
                [newElement.topLeft.x, newElement.topLeft.y - newElement.size.height],
                [newElement.topLeft.x, newElement.topLeft.y],
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
