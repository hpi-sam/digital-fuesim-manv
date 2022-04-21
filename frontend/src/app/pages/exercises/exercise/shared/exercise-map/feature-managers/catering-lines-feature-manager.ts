import type { MapBrowserEvent } from 'ol';
import { Feature } from 'ol';
import LineString from 'ol/geom/LineString';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import type { CateringLine } from 'src/app/shared/types/catering-line';
import type { FeatureManager } from '../utility/feature-manager';
import { ElementManager } from './element-manager';

export class CateringLinesFeatureManager
    extends ElementManager<
        CateringLine,
        LineString,
        Feature<LineString>,
        ReadonlySet<keyof CateringLine>
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
                        color: '#0dcaf0',
                        width: 0.1 / currentZoom,
                    }),
                }),
            };
        }
        return this.cachedStyle.style;
    }

    createFeature(element: CateringLine): Feature<LineString> {
        const feature = new Feature(
            new LineString([
                [element.catererPosition.x, element.catererPosition.y],
                [element.patientPosition.x, element.patientPosition.y],
            ])
        );
        feature.setStyle((thisFeature, currentZoom) =>
            this.getStyle(thisFeature as Feature<LineString>, currentZoom)
        );
        feature.setId(element.id);
        this.layer.getSource()!.addFeature(feature);
        return feature;
    }

    deleteFeature(
        element: CateringLine,
        elementFeature: Feature<LineString>
    ): void {
        this.layer.getSource()!.removeFeature(elementFeature);
    }

    changeFeature(
        oldElement: CateringLine,
        newElement: CateringLine,
        changedProperties: ReadonlySet<keyof CateringLine>,
        elementFeature: Feature<LineString>
    ): void {
        // Rendering the line again is expensive, so we only do it if we must
        if (
            changedProperties.has('catererPosition') ||
            changedProperties.has('patientPosition')
        ) {
            elementFeature.getGeometry()!.setCoordinates([
                [newElement.catererPosition.x, newElement.catererPosition.y],
                [newElement.patientPosition.x, newElement.patientPosition.y],
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

    getFeatureFromElement(element: CateringLine) {
        return this.layer.getSource()!.getFeatureById(element.id) ?? undefined;
    }
}
