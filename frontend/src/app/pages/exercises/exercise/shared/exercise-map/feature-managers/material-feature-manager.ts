import type { Material } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { WithPosition } from '../../utility/types/with-position';
import { withElementImageStyle } from '../utility/with-element-image-style';
import { ElementFeatureManager } from './element-feature-manager';

class BaseMaterialFeatureManager extends ElementFeatureManager<
    WithPosition<Material>
> {
    constructor(
        store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        apiService: ApiService
    ) {
        super(store, olMap, layer, (targetPosition, material) => {
            apiService.proposeAction({
                type: '[Material] Move material',
                materialId: material.id,
                targetPosition,
            });
        });
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MaterialFeatureManager = withElementImageStyle<
    WithPosition<Material>
>(BaseMaterialFeatureManager);
