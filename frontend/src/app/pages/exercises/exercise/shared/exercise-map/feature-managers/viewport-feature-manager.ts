import type { Store } from '@ngrx/store';
import { Size } from 'digital-fuesim-manv-shared';
import type { Viewport } from 'digital-fuesim-manv-shared/src/models/viewport';
import { Feature } from 'ol';
import type OlMap from 'ol/Map';
import LineString from 'ol/geom/LineString';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import type { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import type { FeatureManager } from '../utility/feature-manager';
import { ModifyHelper } from '../utility/modify-helper';
import { withPopup } from '../utility/with-popup';
import { ViewportPopupComponent } from '../shared/viewport-popup/viewport-popup.component';
import { ElementFeatureManager } from './element-feature-manager';

class BaseViewportFeatureManager
    extends ElementFeatureManager<Viewport, LineString>
    implements FeatureManager<Feature<LineString>>
{
    override unsupportedChangeProperties = new Set(['id'] as const);

    constructor(
        store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<LineString>>,
        private readonly apiService: ApiService
    ) {
        super(
            store,
            olMap,
            layer,
            (targetPositions, viewport) => {
                apiService.proposeAction({
                    type: '[Viewport] Move viewport',
                    viewportId: viewport.id,
                    targetPosition: targetPositions[0],
                });
            },
            'LineString',
            (viewport: Viewport) =>
                new Feature(
                    new LineString([
                        [viewport.position.x, viewport.position.y],
                        [
                            viewport.position.x + viewport.size.width,
                            viewport.position.y,
                        ],
                        [
                            viewport.position.x + viewport.size.width,
                            viewport.position.y - viewport.size.height,
                        ],
                        [
                            viewport.position.x,
                            viewport.position.y - viewport.size.height,
                        ],
                        [viewport.position.x, viewport.position.y],
                    ])
                )
        );
    }
    private readonly modifyHelper = new ModifyHelper();

    private readonly style = new Style({
        geometry(thisFeature) {
            const modifyGeometry = thisFeature.get('modifyGeometry');
            return modifyGeometry
                ? modifyGeometry.geometry
                : thisFeature.getGeometry();
        },
        stroke: new Stroke({
            color: '#fafaff',
            width: 2,
        }),
    });

    override createFeature(element: Viewport): Feature<LineString> {
        const feature = super.createFeature(element);
        feature.setStyle(this.style);
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
        return feature;
    }

    override changeFeature(
        oldElement: Viewport,
        newElement: Viewport,
        changedProperties: ReadonlySet<keyof Viewport>,
        elementFeature: Feature<LineString>
    ): void {
        super.changeFeature(
            oldElement,
            newElement,
            changedProperties,
            elementFeature,
            (updatedProperties) =>
                updatedProperties.has('position') ||
                updatedProperties.has('size'),
            (updatedElement) => [
                [updatedElement.position.x, updatedElement.position.y],
                [
                    updatedElement.position.x + updatedElement.size.width,
                    updatedElement.position.y,
                ],
                [
                    updatedElement.position.x + updatedElement.size.width,
                    updatedElement.position.y - updatedElement.size.height,
                ],
                [
                    updatedElement.position.x,
                    updatedElement.position.y - updatedElement.size.height,
                ],
                [updatedElement.position.x, updatedElement.position.y],
            ]
        );
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ViewportFeatureManager = withPopup<
    Viewport,
    typeof BaseViewportFeatureManager,
    ViewportPopupComponent,
    LineString
>(BaseViewportFeatureManager, {
    component: ViewportPopupComponent,
    height: 150,
    width: 225,
    getContext: (feature) => ({ viewportId: feature.getId() as string }),
});
