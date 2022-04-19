import type { MapImage } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import { withElementImageStyle } from '../utility/with-element-image-style';
import { ElementFeatureManager } from './element-feature-manager';

class BaseMapImageFeatureManager extends ElementFeatureManager<MapImage> {
    constructor(
        store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        apiService: ApiService
    ) {
        super(store, olMap, layer, (targetPosition, mapImage) => {
            apiService.proposeAction({
                type: '[MapImage] Move MapImage',
                mapImageId: mapImage.id,
                targetPosition,
            });
        });
    }

    override unsupportedChangeProperties = new Set(['id'] as const);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MapImageFeatureManager = withElementImageStyle<MapImage>(
    BaseMapImageFeatureManager
);
