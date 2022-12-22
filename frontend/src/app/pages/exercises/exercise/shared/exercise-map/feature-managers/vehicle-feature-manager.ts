import type { UUID, Vehicle } from 'digital-fuesim-manv-shared';
import { normalZoom } from 'digital-fuesim-manv-shared';
import type { Feature, MapBrowserEvent } from 'ol';
import type Point from 'ol/geom/Point';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import type { ExerciseService } from 'src/app/core/exercise.service';
import type { WithPosition } from '../../utility/types/with-position';
import { VehiclePopupComponent } from '../shared/vehicle-popup/vehicle-popup.component';
import { ImagePopupHelper } from '../utility/popup-helper';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { NameStyleHelper } from '../utility/style-helper/name-style-helper';
import { createPoint, ElementFeatureManager } from './element-feature-manager';

export class VehicleFeatureManager extends ElementFeatureManager<
    WithPosition<Vehicle>
> {
    readonly type = 'vehicles';

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
    private readonly popupHelper = new ImagePopupHelper(this.olMap, this.layer);

    constructor(
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        private readonly exerciseService: ExerciseService
    ) {
        super(
            olMap,
            layer,
            (targetPosition, vehicle) => {
                exerciseService.proposeAction({
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
            type: 'vehicles';
            value: Vehicle;
        };
        if (!droppedElement || !droppedOnVehicle) {
            console.error('Could not find element for the features');
            return false;
        }
        if (
            (droppedElement.type === 'personnel' &&
                droppedOnVehicle.value.personnelIds[droppedElement.value.id]) ||
            (droppedElement.type === 'materials' &&
                droppedOnVehicle.value.materialIds[droppedElement.value.id]) ||
            (droppedElement.type === 'patients' &&
                Object.keys(droppedOnVehicle.value.patientIds).length <
                    droppedOnVehicle.value.patientCapacity)
        ) {
            // TODO: user feedback (e.g. toast)
            this.exerciseService.proposeAction(
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
                vehicleId: feature.getId() as UUID,
            })
        );
    }
}
