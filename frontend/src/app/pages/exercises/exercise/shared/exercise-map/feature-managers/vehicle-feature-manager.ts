import type { Vehicle } from 'digital-fuesim-manv-shared';
import { normalZoom } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { Feature, MapBrowserEvent } from 'ol';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type { WithPosition } from '../../utility/types/with-position';
import { VehiclePopupComponent } from '../shared/vehicle-popup/vehicle-popup.component';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { NameStyleHelper } from '../utility/style-helper/name-style-helper';
import { ImagePopupHelper } from '../utility/popup-helper';
import { ElementFeatureManager, createPoint } from './element-feature-manager';

export class VehicleFeatureManager extends ElementFeatureManager<
    WithPosition<Vehicle>
> {
    private readonly imageStyleHelper = new ImageStyleHelper(
        (feature) => this.getElementFromFeature(feature)!.value.image
    );
    private readonly nameStyleHelper = new NameStyleHelper(
        (feature) => {
            const vehicle = this.getElementFromFeature(feature)!.value;
            return {
                name: vehicle.name,
                offsetY: vehicle.image.height / 2 / normalZoom,
            };
        },
        0.1,
        'top'
    );
    private readonly popupHelper = new ImagePopupHelper(this.olMap);

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
            createPoint
        );
        this.layer.setStyle((feature, resolution) => [
            this.nameStyleHelper.getStyle(feature as Feature, resolution),
            this.imageStyleHelper.getStyle(feature as Feature, resolution),
        ]);
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
                droppedOnVehicle.value.materialIds[droppedElement.value.id]) ||
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

    public override onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<any>
    ): void {
        super.onFeatureClicked(event, feature);

        this.togglePopup$.next(
            this.popupHelper.getPopupOptions(VehiclePopupComponent, feature, {
                vehicleId: feature.getId() as string,
            })
        );
    }
}
