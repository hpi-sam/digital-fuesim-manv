import type { MapImage } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { Feature, MapBrowserEvent } from 'ol';
import { MapImagePopupComponent } from '../shared/map-image-popup/map-image-popup.component';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { ImagePopupHelper } from '../utility/popup-helper';
import { ElementFeatureManager, createPoint } from './element-feature-manager';

export class MapImageFeatureManager extends ElementFeatureManager<MapImage> {
    private readonly imageStyleHelper = new ImageStyleHelper(
        (feature) => this.getElementFromFeature(feature)!.value.image
    );
    private readonly popupHelper = new ImagePopupHelper(this.olMap);

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
            (targetPosition, mapImage) => {
                apiService.proposeAction({
                    type: '[MapImage] Move MapImage',
                    mapImageId: mapImage.id,
                    targetPosition,
                });
            },
            createPoint
        );
        this.layer.setStyle((feature, resolution) =>
            this.imageStyleHelper.getStyle(feature as Feature, resolution)
        );
    }

    public override onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<any>
    ): void {
        super.onFeatureClicked(event, feature);

        if (this.apiService.currentRole !== 'trainer') {
            return;
        }
        this.togglePopup$.next(
            this.popupHelper.getPopupOptions(MapImagePopupComponent, feature, {
                mapImageId: feature.getId() as string,
            })
        );
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}
