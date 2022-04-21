/* eslint-disable @typescript-eslint/naming-convention */
import type { Vehicle } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { Feature } from 'ol';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type { WithPosition } from '../../utility/types/with-position';
import { VehiclePopupComponent } from '../shared/vehicle-popup/vehicle-popup.component';
import { withPopup } from '../utility/with-popup';
import { withElementImageStyle } from '../utility/with-element-image-style';
import { ElementFeatureManager } from './element-feature-manager';

class VehicleFeatureManagerBase extends ElementFeatureManager<
    WithPosition<Vehicle>
> {
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
            (targetPosition, vehicle) => {
                apiService.proposeAction({
                    type: '[Vehicle] Move vehicle',
                    vehicleId: vehicle.id,
                    targetPosition,
                });
            },
            'Point',
            undefined
        );
    }

    public override onFeatureDrop(
        dropEvent: TranslateEvent,
        droppedFeature: Feature<any>,
        droppedOnFeature: Feature<Point>
    ) {
        const droppedElement = this.getElementFromFeature(droppedFeature);
        const droppedOnVehicle = this.getElementFromFeature(
            droppedOnFeature
        ) as {
            type: 'vehicle';
            value: Vehicle;
        };
        if (!droppedElement || !droppedOnVehicle) {
            console.error('Could not find element for the features');
            return false;
        }
        if (
            (droppedElement.type === 'personnel' &&
                droppedOnVehicle.value.personnelIds[droppedElement.value.id]) ||
            (droppedElement.type === 'material' &&
                droppedOnVehicle.value.materialId ===
                    droppedElement.value.id) ||
            (droppedElement.type === 'patient' &&
                Object.keys(droppedOnVehicle.value.patientIds).length <
                    droppedOnVehicle.value.patientCapacity)
        ) {
            // TODO: user feedback (e.g. toast)
            this.apiService.proposeAction(
                {
                    type: '[Vehicle] Load vehicle',
                    vehicleId: droppedOnVehicle.value.id,
                    elementToBeLoadedId: droppedElement.value.id,
                    elementToBeLoadedType: droppedElement.type,
                },
                true
            );
            return true;
        }
        return false;
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}

const VehicleFeatureManagerWithImageStyle = withElementImageStyle<
    WithPosition<Vehicle>
>(VehicleFeatureManagerBase);

export const VehicleFeatureManager = withPopup<
    WithPosition<Vehicle>,
    typeof VehicleFeatureManagerWithImageStyle,
    VehiclePopupComponent
>(VehicleFeatureManagerWithImageStyle, {
    component: VehiclePopupComponent,
    height: 150,
    width: 225,
    getContext: (feature) => ({ vehicleId: feature.getId() as string }),
});
