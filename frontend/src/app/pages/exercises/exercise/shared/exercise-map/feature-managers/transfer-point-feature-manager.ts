/* eslint-disable @typescript-eslint/naming-convention */
import { TransferPoint } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { Feature } from 'ol';
import type { TranslateEvent } from 'ol/interaction/Translate';
import { withPopup } from '../utility/with-popup';
import { TransferPointPopupComponent } from '../shared/transfer-point-popup/transfer-point-popup.component';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { NameStyleHelper } from '../utility/style-helper/name-style-helper';
import { ElementFeatureManager } from './element-feature-manager';

class TransferPointFeatureManagerBase extends ElementFeatureManager<TransferPoint> {
    constructor(
        store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        apiService: ApiService
    ) {
        super(store, olMap, layer, (targetPosition, transferPoint) => {
            apiService.proposeAction({
                type: '[TransferPoint] Move TransferPoint',
                transferPointId: transferPoint.id,
                targetPosition,
            });
        });
        layer.setStyle((thisFeature, currentZoom) => [
            this.imageStyleHelper.getStyle(
                thisFeature as Feature<Point>,
                currentZoom
            ),
            this.nameStyleHelper.getStyle(
                thisFeature as Feature<Point>,
                currentZoom
            ),
        ]);
    }

    private readonly imageStyleHelper = new ImageStyleHelper(
        (feature: Feature) => ({
            url: TransferPoint.image.url,
            height: TransferPoint.image.height,
            aspectRatio: TransferPoint.image.aspectRatio,
        })
    );
    private readonly nameStyleHelper = new NameStyleHelper(
        (feature: Feature) => ({
            name: this.getElementFromFeature(feature)!.value.internalName,
            offsetY: 0,
        }),
        0.2,
        'middle'
    );

    public override onFeatureDrop(
        dropEvent: TranslateEvent,
        droppedFeature: Feature<any>,
        droppedOnFeature: Feature<Point>
    ) {
        const droppedElement = this.getElementFromFeature(droppedFeature);
        const droppedOnVehicle = this.getElementFromFeature(droppedOnFeature);
        if (!droppedElement || !droppedOnVehicle) {
            console.error('Could not find element for the features');
            return false;
        }
        // TODO: Implement transferring of the dropped element
        return false;
    }

    override unsupportedChangeProperties = new Set([
        'id',
        'internalName',
    ] as const);
}

export const TransferPointFeatureManager = withPopup<
    TransferPoint,
    typeof TransferPointFeatureManagerBase,
    TransferPointPopupComponent
>(TransferPointFeatureManagerBase, {
    component: TransferPointPopupComponent,
    height: 150,
    width: 225,
    getContext: (feature) => ({ transferPointId: feature.getId() as string }),
});
