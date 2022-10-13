import type { MapImage, UUID } from 'digital-fuesim-manv-shared';
import type { Feature, MapBrowserEvent } from 'ol';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import { MapImagePopupComponent } from '../shared/map-image-popup/map-image-popup.component';
import { ImagePopupHelper } from '../utility/popup-helper';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { createPoint, ElementFeatureManager } from './element-feature-manager';

export class MapImageFeatureManager extends ElementFeatureManager<MapImage> {
    readonly type = 'mapImages';
    private readonly imageStyleHelper = new ImageStyleHelper(
        (feature) => this.getElementFromFeature(feature)!.value.image
    );
    private readonly popupHelper = new ImagePopupHelper(this.olMap);

    constructor(
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        private readonly apiService: ApiService
    ) {
        super(
            olMap,
            layer,
            (targetPosition, mapImage) => {
                apiService.proposeAction({
                    type: '[MapImage] Move MapImage',
                    mapImageId: mapImage.id,
                    targetPosition,
                });
            },
            createPoint
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

        if (this.apiService.getCurrentRole() !== 'trainer') {
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
            this.apiService.getCurrentRole() === 'trainer' && !mapImage.isLocked
        );
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}
