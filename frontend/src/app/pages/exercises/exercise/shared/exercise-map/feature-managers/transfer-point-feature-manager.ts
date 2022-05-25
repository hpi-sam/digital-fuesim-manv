import type { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { TransferPoint } from 'digital-fuesim-manv-shared';
import type { Feature, MapBrowserEvent } from 'ol';
import type Point from 'ol/geom/Point';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { ChooseTransferTargetPopupComponent } from '../shared/choose-transfer-target-popup/choose-transfer-target-popup.component';
import { TransferPointPopupComponent } from '../shared/transfer-point-popup/transfer-point-popup.component';
import { ImagePopupHelper } from '../utility/popup-helper';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { NameStyleHelper } from '../utility/style-helper/name-style-helper';
import { createPoint, ElementFeatureManager } from './element-feature-manager';

export class TransferPointFeatureManager extends ElementFeatureManager<TransferPoint> {
    private readonly popupHelper = new ImagePopupHelper(this.olMap);

    constructor(
        store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        private readonly apiService: ApiService,
        private readonly isTrainer: boolean
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
        const reachableTransferPointIds = Object.keys(
            droppedOnTransferPoint.reachableTransferPoints
        );

        const reachableHospitalIds = Object.keys(
            droppedOnTransferPoint.reachableHospitals
        );

        const proposeTransfer = (
            targetId: UUID,
            targetType: 'hospital' | 'transferPoint'
        ) => {
            if (targetType === 'hospital') {
                this.apiService.proposeAction(
                    {
                        type: '[Hospital] Transport patient to hospital',
                        hospitalId: targetId,
                        vehicleId: droppedElement.value.id,
                    },
                    true
                );
                return;
            }
            this.apiService.proposeAction(
                {
                    type: '[Transfer] Add to transfer',
                    // TODO: The type should already be correct
                    elementType:
                        droppedElement.type === 'vehicle'
                            ? 'vehicles'
                            : 'personnel',
                    elementId: droppedElement.value.id,
                    startTransferPointId: droppedOnTransferPoint.id,
                    targetTransferPointId: targetId,
                },
                true
            );
        };
        if (
            reachableTransferPointIds.length === 0 &&
            reachableHospitalIds.length === 0
        ) {
            return false;
        }
        if (
            reachableTransferPointIds.length === 1 &&
            (reachableHospitalIds.length === 0 ||
                droppedElement.type === 'personnel')
        ) {
            // There is an obvious answer to which transferPoint the vehicle or personnel should transfer to
            proposeTransfer(reachableTransferPointIds[0], 'transferPoint');
            return true;
        }

        if (
            reachableTransferPointIds.length === 0 &&
            reachableHospitalIds.length === 1 &&
            droppedElement.type === 'vehicle'
        ) {
            // There is an obvious answer to which hospital the vehicle should transport a patient / the patients to
            proposeTransfer(reachableHospitalIds[0], 'hospital');
            return true;
        }

        if (
            reachableTransferPointIds.length === 0 &&
            droppedElement.type === 'personnel'
        ) {
            // Personnel should only be able to transfer transferPoints
            return false;
        }

        // Show a popup to choose the transferPoint or hospital
        this.togglePopup$.next(
            this.popupHelper.getPopupOptions(
                ChooseTransferTargetPopupComponent,
                droppedOnFeature,
                {
                    transferPointId: droppedOnTransferPoint.id,
                    droppedElementType: droppedElement.type,
                    transferToCallback: proposeTransfer,
                }
            )
        );
        return true;
    }

    public override onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<any>
    ): void {
        super.onFeatureClicked(event, feature);

        if (!this.isTrainer) {
            return;
        }
        this.togglePopup$.next(
            this.popupHelper.getPopupOptions(
                TransferPointPopupComponent,
                feature,
                {
                    transferPointId: feature.getId() as string,
                }
            )
        );
    }

    override unsupportedChangeProperties = new Set([
        'id',
        'internalName',
    ] as const);
}
