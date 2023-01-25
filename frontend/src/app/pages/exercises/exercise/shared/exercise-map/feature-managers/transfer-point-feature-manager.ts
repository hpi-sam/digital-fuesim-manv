import type { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { TransferPoint, TransferStartPoint } from 'digital-fuesim-manv-shared';
import type { Feature, MapBrowserEvent } from 'ol';
import type Point from 'ol/geom/Point';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import type { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import { ChooseTransferTargetPopupComponent } from '../shared/choose-transfer-target-popup/choose-transfer-target-popup.component';
import { TransferPointPopupComponent } from '../shared/transfer-point-popup/transfer-point-popup.component';
import {
    createPoint,
    getCoordinatesPoint,
    getCoordinatesPositionableElement,
    getNextPositionPoint,
    getPositionPoint,
} from '../utility/ol-geometry-helpers';
import { ImagePopupHelper } from '../utility/popup-helper';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { NameStyleHelper } from '../utility/style-helper/name-style-helper';
import { MoveableFeatureManager } from './moveable-feature-manager';

export class TransferPointFeatureManager extends MoveableFeatureManager<TransferPoint> {
    readonly type = 'transferPoints';
    private readonly popupHelper = new ImagePopupHelper(this.olMap, this.layer);

    constructor(
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {
        super(
            olMap,
            layer,
            (targetPosition, transferPoint) => {
                exerciseService.proposeAction({
                    type: '[TransferPoint] Move TransferPoint',
                    transferPointId: transferPoint.id,
                    targetPosition,
                });
            },
            createPoint,
            getNextPositionPoint,
            getCoordinatesPoint,
            getCoordinatesPositionableElement,
            getPositionPoint
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
            droppedElement.type !== 'vehicles' &&
            droppedElement.type !== 'personnel'
        ) {
            return false;
        }

        // Always show the chooseTransferPopup
        // Show a popup to choose the transferPoint or hospital
        this.togglePopup$.next(
            this.popupHelper.getPopupOptions(
                ChooseTransferTargetPopupComponent,
                droppedOnFeature,
                {
                    transferPointId: droppedOnTransferPoint.id,
                    droppedElementType: droppedElement.type,
                    transferToCallback: (
                        targetId: UUID,
                        targetType: 'hospital' | 'transferPoint'
                    ) => {
                        if (targetType === 'hospital') {
                            this.exerciseService.proposeAction(
                                {
                                    type: '[Hospital] Transport patient to hospital',
                                    hospitalId: targetId,
                                    vehicleId: droppedElement.value.id,
                                },
                                true
                            );
                            return;
                        }
                        this.exerciseService.proposeAction(
                            {
                                type: '[Transfer] Add to transfer',
                                elementType: droppedElement.type,
                                elementId: droppedElement.value.id,
                                startPoint: TransferStartPoint.create(
                                    droppedOnTransferPoint.id
                                ),
                                targetTransferPointId: targetId,
                            },
                            true
                        );
                    },
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

        if (selectStateSnapshot(selectCurrentRole, this.store) !== 'trainer') {
            return;
        }
        this.togglePopup$.next(
            this.popupHelper.getPopupOptions(
                TransferPointPopupComponent,
                feature,
                {
                    transferPointId: feature.getId() as UUID,
                }
            )
        );
    }

    override isFeatureTranslatable(feature: Feature<Point>): boolean {
        return selectStateSnapshot(selectCurrentRole, this.store) === 'trainer';
    }

    override unsupportedChangeProperties = new Set([
        'id',
        'internalName',
    ] as const);
}
