/* eslint-disable @typescript-eslint/naming-convention */
import type {
    TransferPersonnelAction,
    TransferVehicleAction,
    UUID,
} from 'digital-fuesim-manv-shared';
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
import { Subject } from 'rxjs';
import { withPopup } from '../utility/with-popup';
import { TransferPointPopupComponent } from '../shared/transfer-point-popup/transfer-point-popup.component';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { NameStyleHelper } from '../utility/style-helper/name-style-helper';
import { ChooseTransferTargetPopupComponent } from '../shared/choose-transfer-target-popup/choose-transfer-target-popup.component';
import { calculatePopupPositioning } from '../utility/calculate-popup-positioning';
import type { OpenPopupOptions } from '../utility/popup-manager';
import { ElementFeatureManager, createPoint } from './element-feature-manager';

class TransferPointFeatureManagerBase extends ElementFeatureManager<TransferPoint> {
    constructor(
        store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        private readonly apiService: ApiService
    ) {
        super(
            store,
            olMap,
            layer,
            (targetPosition, transferPoint) => {
                apiService.proposeAction({
                    type: '[TransferPoint] Move TransferPoint',
                    transferPointId: transferPoint.id,
                    targetPosition,
                });
            },
            createPoint
        );
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

    public readonly togglePopup$ = new Subject<OpenPopupOptions<any>>();

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
        // TODO: droppedElement isn't necessarily a transfer point -> fix getElementFromFeature typings
        const droppedElement = this.getElementFromFeature(droppedFeature);
        const droppedOnTransferPoint: TransferPoint =
            this.getElementFromFeature(droppedOnFeature)!.value!;
        if (!droppedElement || !droppedOnTransferPoint) {
            console.error('Could not find element for the features');
            return false;
        }
        if (
            droppedElement.type !== 'vehicle' &&
            droppedElement.type !== 'personnel'
        ) {
            return false;
        }
        const proposeTransfer = (targetTransferPointId: UUID) => {
            const action: TransferPersonnelAction | TransferVehicleAction =
                droppedElement.type === 'vehicle'
                    ? {
                          type: '[Vehicle] Transfer vehicle',
                          vehicleId: droppedElement.value.id,
                          startTransferPointId: droppedOnTransferPoint.id,
                          targetTransferPointId,
                      }
                    : {
                          type: '[Personnel] Transfer personnel',
                          personnelId: droppedElement.value.id,
                          startTransferPointId: droppedOnTransferPoint.id,
                          targetTransferPointId,
                      };
            this.apiService.proposeAction(action, true);
        };
        const reachableTransferPointIds = Object.keys(
            droppedOnTransferPoint.reachableTransferPoints
        );
        if (reachableTransferPointIds.length === 0) {
            return false;
        }
        if (reachableTransferPointIds.length === 1) {
            // There is an obvious answer to which transfer point the vehicle should transfer to
            proposeTransfer(reachableTransferPointIds[0]);
            return true;
        }
        // Show a popup to choose the transfer point
        // TODO: refactor this, to remove code duplication in withPopup
        const featureCenter = droppedOnFeature.getGeometry()!.getCoordinates();
        const view = this.olMap.getView();
        const zoom = view.getZoom()!;
        const { position, positioning } = calculatePopupPositioning(
            featureCenter,
            {
                // TODO: tweak these numbers
                width: 400 / zoom,
                height: 300 / zoom,
            },
            view.getCenter()!
        );
        const popupOptions: OpenPopupOptions<ChooseTransferTargetPopupComponent> =
            {
                component: ChooseTransferTargetPopupComponent,
                position,
                positioning,
                context: {
                    transferPointId: droppedOnTransferPoint.id,
                    transferToCallback: proposeTransfer,
                },
            };
        this.togglePopup$.next(popupOptions);
        return true;
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
