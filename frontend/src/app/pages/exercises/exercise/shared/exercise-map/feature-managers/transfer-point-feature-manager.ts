/* eslint-disable @typescript-eslint/naming-convention */
import type {
    TransferPersonnelAction,
    TransferVehicleAction,
    UUID,
} from 'digital-fuesim-manv-shared';
import { normalZoom, TransferPoint } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { Feature } from 'ol';
import type { TranslateEvent } from 'ol/interaction/Translate';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import OlText from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import { Subject } from 'rxjs';
import type { WithPosition } from '../../utility/types/with-position';
import { withPopup } from '../utility/with-popup';
import { TransferPointPopupComponent } from '../shared/transfer-point-popup/transfer-point-popup.component';
import type { OpenPopupOptions } from '../utility/popup-manager';
import { calculatePopupPositioning } from '../utility/calculate-popup-positioning';
import { ChooseTransferTargetPopupComponent } from '../shared/choose-transfer-target-popup/choose-transfer-target-popup.component';
import { ElementFeatureManager } from './element-feature-manager';

class TransferPointFeatureManagerBase extends ElementFeatureManager<TransferPoint> {
    constructor(
        store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        private readonly apiService: ApiService
    ) {
        super(store, olMap, layer, (targetPosition, transferPoint) => {
            apiService.proposeAction({
                type: '[TransferPoint] Move TransferPoint',
                transferPointId: transferPoint.id,
                targetPosition,
            });
        });
    }

    private readonly styleCache = new Map<string, Style>();
    public readonly togglePopup$ = new Subject<OpenPopupOptions<any>>();

    private previousZoom?: number;
    /**
     *
     * @param feature The feature that should be styled
     * @param currentZoom This is for some reason also called `resolution` in the ol typings
     * @returns The style that should be used for the feature
     */
    // This function should be as efficient as possible, because it is called per feature on each rendered frame
    private getStyle(feature: Feature<Point>, currentZoom: number) {
        if (this.previousZoom !== currentZoom) {
            this.previousZoom = currentZoom;
            this.styleCache.clear();
        }
        const element = this.getElementFromFeature(feature)!.value;
        const key = JSON.stringify({
            name: element.internalName,
        });
        if (!this.styleCache.has(key)) {
            this.styleCache.set(
                key,
                new Style({
                    image: new Icon({
                        src: TransferPoint.image.url,
                        scale:
                            TransferPoint.image.height /
                            (currentZoom * normalZoom) /
                            // TODO: remove this hack, look at height in transfer-point.svg, is also 102
                            102,
                    }),
                    text: new OlText({
                        text: element.internalName,
                        scale: 0.2 / currentZoom,
                        fill: new Fill({
                            color: '#FEFEFE',
                        }),
                    }),
                })
            );
        }
        return this.styleCache.get(key)!;
    }

    public override createFeature(element: WithPosition<TransferPoint>): void {
        super.createFeature(element);
        // Because the feature is already added in the super method, there is a short flickering
        const feature = this.getFeatureFromElement(element)!;
        feature.setStyle((thisFeature, currentZoom) =>
            this.getStyle(thisFeature as Feature<Point>, currentZoom)
        );
    }

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
