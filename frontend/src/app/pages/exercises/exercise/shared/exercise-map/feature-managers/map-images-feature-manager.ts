import type { Store } from '@ngrx/store';
import type { MapImage, UUID } from 'digital-fuesim-manv-shared';
import type { Feature, MapBrowserEvent } from 'ol';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import type { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import { MapImagePopupComponent } from '../shared/map-image-popup/map-image-popup.component';
import {
    createPoint,
    getCoordinatesPoint,
    getCoordinatesPositionableElement,
    getNextPositionPoint,
    getPositionPoint,
} from '../utility/ol-geometry-helpers';
import { ImagePopupHelper } from '../utility/popup-helper';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { MoveableFeatureManager } from './moveable-feature-manager';

export class MapImageFeatureManager extends MoveableFeatureManager<MapImage> {
    readonly type = 'mapImages';
    private readonly imageStyleHelper = new ImageStyleHelper(
        (feature) => this.getElementFromFeature(feature)!.value.image
    );
    private readonly popupHelper = new ImagePopupHelper(this.olMap, this.layer);

    constructor(
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {
        super(
            olMap,
            layer,
            (targetPosition, mapImage) => {
                exerciseService.proposeAction({
                    type: '[MapImage] Move MapImage',
                    mapImageId: mapImage.id,
                    targetPosition,
                });
            },
            createPoint,
            getNextPositionPoint,
            getCoordinatesPoint,
            getCoordinatesPositionableElement,
            getPositionPoint
        );
        this.layer.setStyle((feature, resolution) => {
            const style = this.imageStyleHelper.getStyle(
                feature as Feature,
                resolution
            );
            style.setZIndex(
                this.getElementFromFeature(feature as Feature)!.value.zIndex
            );
            return style;
        });
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
            this.popupHelper.getPopupOptions(MapImagePopupComponent, feature, {
                mapImageId: feature.getId() as UUID,
            })
        );
    }

    override isFeatureTranslatable(feature: Feature<Point>): boolean {
        const mapImage = this.getElementFromFeature(feature).value as MapImage;
        return (
            selectStateSnapshot(selectCurrentRole, this.store) === 'trainer' &&
            !mapImage.isLocked
        );
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}
