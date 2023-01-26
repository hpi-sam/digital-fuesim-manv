import type { MapBrowserEvent } from 'ol';
import { Feature } from 'ol';
import LineString from 'ol/geom/LineString';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import type { TransferLine } from 'src/app/shared/types/transfer-line';
import type { FeatureManager } from '../utility/feature-manager';
import { ElementManager } from './element-manager';

export class TransferLinesFeatureManager
    extends ElementManager<
        TransferLine,
        LineString,
        ReadonlySet<keyof TransferLine>
    >
    implements FeatureManager<LineString>
{
    readonly unsupportedChangeProperties = new Set(['id'] as const);

    constructor(public readonly layer: VectorLayer<VectorSource<LineString>>) {
        super();
        layer.setStyle(
            new Style({
                stroke: new Stroke({
                    color: '#fd7e14',
                    // We don't want to scale with the zoom to be better seen when zoomed out
                    width: 3,
                }),
            })
        );
    }

    createFeature(element: TransferLine): Feature<LineString> {
        const feature = new Feature(
            new LineString([
                [element.startPosition.x, element.startPosition.y],
                [element.endPosition.x, element.endPosition.y],
            ])
        );
        feature.setId(element.id);
        this.layer.getSource()!.addFeature(feature);
        return feature;
    }

    deleteFeature(
        element: TransferLine,
        elementFeature: Feature<LineString>
    ): void {
        this.layer.getSource()!.removeFeature(elementFeature);
    }

    changeFeature(
        oldElement: TransferLine,
        newElement: TransferLine,
        changedProperties: ReadonlySet<keyof TransferLine>,
        elementFeature: Feature<LineString>
    ): void {
        // Rendering the line again is expensive, so we only do it if we must
        if (
            changedProperties.has('startPosition') ||
            changedProperties.has('endPosition')
        ) {
            elementFeature.getGeometry()!.setCoordinates([
                [newElement.startPosition.x, newElement.startPosition.y],
                [newElement.endPosition.x, newElement.endPosition.y],
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

    getFeatureFromElement(element: TransferLine) {
        return this.layer.getSource()!.getFeatureById(element.id) ?? undefined;
    }

    isFeatureTranslatable(feature: Feature<LineString>) {
        return false;
    }
}
