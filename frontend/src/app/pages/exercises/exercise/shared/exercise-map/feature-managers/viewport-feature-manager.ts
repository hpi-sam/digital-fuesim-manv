import { Size } from 'digital-fuesim-manv-shared';
import type { Viewport } from 'digital-fuesim-manv-shared/src/models/viewport';
import type { MapBrowserEvent } from 'ol';
import { Feature } from 'ol';
import LineString from 'ol/geom/LineString';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import type { ApiService } from 'src/app/core/api.service';
import type { FeatureManager } from '../utility/feature-manager';
import { ModifyHelper } from '../utility/modify-helper';
import { TranslateHelper } from '../utility/translate-helper';
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

    constructor(
        public readonly layer: VectorLayer<VectorSource<LineString>>,
        private readonly apiService: ApiService
    ) {
        super();
    }

    private readonly translateHelper = new TranslateHelper<LineString>();
    private readonly modifyHelper = new ModifyHelper();

    /**
     *
     * @param feature The feature that should be styled
     * @param currentZoom This is for some reason also called `resolution` in the ol typings
     * @returns The style that should be used for the feature
     */
    // This function should be as efficient as possible, because it is called per feature on each rendered frame
    private getStyle(feature: Feature<LineString>) {
        return new Style({
            stroke: new Stroke({
                color: '#fafaff',
                width: 2,
            }),
        });
    }

    createFeature(element: Viewport): void {
        const feature = new Feature(
            new LineString([
                [element.topLeft.x, element.topLeft.y],
                [element.topLeft.x + element.size.width, element.topLeft.y],
                [
                    element.topLeft.x + element.size.width,
                    element.topLeft.y - element.size.height,
                ],
                [element.topLeft.x, element.topLeft.y - element.size.height],
                [element.topLeft.x, element.topLeft.y],
            ])
        );
        feature.setStyle((thisFeature) =>
            this.getStyle(thisFeature as Feature<LineString>)
        );
        feature.setId(element.id);
        this.layer.getSource()!.addFeature(feature);
        this.translateHelper.onTranslateEnd(feature, (newPositions) => {
            this.apiService.proposeAction(
                {
                    type: '[Viewport] Move viewport',
                    viewportId: element.id,
                    targetPosition: newPositions[0],
                },
                true
            );
        });
        this.modifyHelper.onModifyEnd(feature, (newPositions) => {
            const lineString = newPositions;

            const topLeft = lineString[0];
            const bottomRight = lineString[2];
            this.apiService.proposeAction({
                type: '[Viewport] Resize viewport',
                viewportId: element.id,
                targetPosition: topLeft,
                newSize: Size.create(
                    bottomRight.x - topLeft.x,
                    topLeft.y - bottomRight.y
                ),
            });
        });
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
        if (changedProperties.has('topLeft') || changedProperties.has('size')) {
            elementFeature.getGeometry()!.setCoordinates([
                [newElement.topLeft.x, newElement.topLeft.y],
                [
                    newElement.topLeft.x + newElement.size.width,
                    newElement.topLeft.y,
                ],
                [
                    newElement.topLeft.x + newElement.size.width,
                    newElement.topLeft.y - newElement.size.height,
                ],
                [
                    newElement.topLeft.x,
                    newElement.topLeft.y - newElement.size.height,
                ],
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
