import type { Material } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { WithPosition } from '../../utility/types/with-position';
import { CommonFeatureManager } from './common-feature-manager';

export class MaterialFeatureManager extends CommonFeatureManager<
    WithPosition<Material>
> {
    constructor(
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        apiService: ApiService
    ) {
        super(
            olMap,
            layer,
            {
                imageHeight: 40,
                imageUrl: './assets/material.svg',
            },
            (targetPosition, material) => {
                apiService.proposeAction({
                    type: '[Material] Move material',
                    materialId: material.id,
                    targetPosition,
                });
            }
        );
    }
}
