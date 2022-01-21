import type { Personell } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import { CommonFeatureManager } from './common-feature-manager';

export class PersonellFeatureManager extends CommonFeatureManager<Personell> {
    constructor(
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        private readonly apiService: ApiService
    ) {
        super(
            olMap,
            layer,
            {
                imageHeight: 80,
                imageUrl: './assets/personell.png',
            },
            (newPosition, personell) => {
                this.apiService.proposeAction({
                    type: '[Personell] Move personell',
                    personellId: personell.id,
                    position: newPosition,
                });
            }
        );
    }
}
