import type { Vehicle } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { WithPosition } from '../../utility/types/with-position';
import { VehiclePopupComponent } from '../shared/vehicle-popup/vehicle-popup.component';
import { CommonFeatureManager } from './common-feature-manager';

export class VehicleFeatureManager extends CommonFeatureManager<
    WithPosition<Vehicle>,
    VehiclePopupComponent
> {
    public static normalizedImageHeight = 200;

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
                imageHeight: VehicleFeatureManager.normalizedImageHeight,
                imageUrl: './assets/vehicle.svg',
            },
            (targetPosition, vehicle) => {
                apiService.proposeAction({
                    type: '[Vehicle] Move vehicle',
                    vehicleId: vehicle.id,
                    targetPosition,
                });
            },
            {
                component: VehiclePopupComponent,
                height: 150,
                width: 225,
                getContext: (feature) => ({ vehicleId: feature.getId()! }),
            }
        );
    }
}
