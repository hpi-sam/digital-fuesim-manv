import type { Personell } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Feature } from 'ol';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { WithPosition } from '../../utility/types/with-position';
import { CommonFeatureManager } from './common-feature-manager';

export class PersonellFeatureManager extends CommonFeatureManager<
    WithPosition<Personell>
> {
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
            {
                imageHeight: 80,
                imageUrl: './assets/personell.png',
            },
            (targetPosition, personell) => {
                apiService.proposeAction({
                    type: '[Personell] Move personell',
                    personellId: personell.id,
                    targetPosition,
                });
            }
        );
    }

}
