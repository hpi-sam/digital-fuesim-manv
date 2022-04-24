import type { MapImage } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import { withElementImageStyle } from '../utility/with-element-image-style';
import { withPopup } from '../utility/with-popup';
import { MapImagePopupComponent } from '../shared/map-image-popup/map-image-popup.component';
import { ElementFeatureManager, pointCreator } from './element-feature-manager';

class BaseMapImageFeatureManager extends ElementFeatureManager<MapImage> {
    constructor(
        store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        apiService: ApiService
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
            pointCreator
        );
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const MapImageFeatureManagerWithImageStyle = withElementImageStyle<MapImage>(
    BaseMapImageFeatureManager
);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MapImageFeatureManager = withPopup<
    MapImage,
    typeof MapImageFeatureManagerWithImageStyle,
    MapImagePopupComponent
>(MapImageFeatureManagerWithImageStyle, {
    component: MapImagePopupComponent,
    height: 110,
    width: 50,
    getContext: (feature) => ({ mapImageId: feature.getId() as string }),
});
