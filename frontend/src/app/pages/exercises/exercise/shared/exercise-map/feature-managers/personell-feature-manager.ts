import type { Personell } from 'digital-fuesim-manv-shared';
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

class BasePersonellFeatureManager extends ElementFeatureManager<
    WithPosition<Personell>
> {
    constructor(
        store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        apiService: ApiService
    ) {
        super(store, olMap, layer, (targetPosition, personell) => {
            apiService.proposeAction({
                type: '[Personell] Move personell',
                personellId: personell.id,
                targetPosition,
            });
        });
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PersonellFeatureManager = withElementImageStyle<
    WithPosition<Personell>
>(BasePersonellFeatureManager);
