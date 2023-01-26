import type { MapBrowserEvent } from 'ol';
import { Feature } from 'ol';
import LineString from 'ol/geom/LineString';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import { rgbColorPalette } from 'src/app/shared/functions/colors';
import type { CateringLine } from 'src/app/shared/types/catering-line';
import type { FeatureManager } from '../utility/feature-manager';
import { LineStyleHelper } from '../utility/style-helper/line-style-helper';
import { ElementManager } from './element-manager';

export class CateringLinesFeatureManager
    extends ElementManager<
        CateringLine,
        LineString,
        ReadonlySet<keyof CateringLine>
    >
    implements FeatureManager<LineString>
{
    readonly type = 'cateringLines';
    readonly unsupportedChangeProperties = new Set(['id'] as const);

    private readonly lineStyleHelper = new LineStyleHelper(
        (feature) => ({
            color: rgbColorPalette.cyan,
        }),
        0.05
    );

    constructor(public readonly layer: VectorLayer<VectorSource<LineString>>) {
        super();
        layer.setStyle((feature, currentZoom) =>
            this.lineStyleHelper.getStyle(feature as Feature, currentZoom)
        );
    }

    public isFeatureTranslatable(feature: Feature<LineString>) {
        return false;
    }

    createFeature(element: CateringLine): Feature<LineString> {
        const feature = new Feature(
            new LineString([
                [element.catererPosition.x, element.catererPosition.y],
                [element.patientPosition.x, element.patientPosition.y],
            ])
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
