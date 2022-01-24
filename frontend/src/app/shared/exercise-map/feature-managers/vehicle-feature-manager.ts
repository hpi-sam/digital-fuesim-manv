import type { Vehicle } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { WithPosition } from '../../utility/types/with-position';
import { CommonFeatureManager } from './common-feature-manager';

export class VehicleFeatureManager extends CommonFeatureManager<
    WithPosition<Vehicle>
> {
    constructor(
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        private readonly apiService: ApiService
    ) {
        super(
            olMap,
            layer,
            {
                imageHeight: 200,
                imageUrl: './assets/vehicle.svg',
            },
            (newPosition, vehicle) => {
                this.apiService.proposeAction({
                    type: '[Vehicle] Move vehicle',
                    vehicleId: vehicle.id,
                    position: newPosition,
                });
            }
        );
    }
}
