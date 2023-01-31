import type { Material, UUID } from 'digital-fuesim-manv-shared';
import { normalZoom } from 'digital-fuesim-manv-shared';
import type { Feature, MapBrowserEvent } from 'ol';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import type { ExerciseService } from 'src/app/core/exercise.service';
import { MaterialPopupComponent } from '../shared/material-popup/material-popup.component';
import { PointGeometryHelper } from '../utility/point-geometry-helper';
import { ImagePopupHelper } from '../utility/popup-helper';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { NameStyleHelper } from '../utility/style-helper/name-style-helper';
import { MoveableFeatureManager } from './moveable-feature-manager';

export class MaterialFeatureManager extends MoveableFeatureManager<Material> {
    private readonly imageStyleHelper = new ImageStyleHelper(
        (feature) => (this.getElementFromFeature(feature) as Material).image
    );
    private readonly nameStyleHelper = new NameStyleHelper(
        (feature) => {
            const material = this.getElementFromFeature(feature) as Material;
            return {
                name: material.vehicleName,
                offsetY: material.image.height / 2 / normalZoom,
            };
        },
        0.025,
        'top'
    );

    private readonly popupHelper = new ImagePopupHelper(this.olMap, this.layer);

    constructor(
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        exerciseService: ExerciseService
    ) {
        super(
            olMap,
            layer,
            (targetPosition, material) => {
                exerciseService.proposeAction({
                    type: '[Material] Move material',
                    materialId: material.id,
                    targetPosition,
                });
            },
            new PointGeometryHelper()
        );
        this.layer.setStyle((feature, resolution) => [
            this.nameStyleHelper.getStyle(feature as Feature, resolution),
            this.imageStyleHelper.getStyle(feature as Feature, resolution),
        ]);
    }

    public override onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<any>
    ): void {
        super.onFeatureClicked(event, feature);

        this.togglePopup$.next(
            this.popupHelper.getPopupOptions(MaterialPopupComponent, feature, {
                materialId: feature.getId() as UUID,
            })
        );
    }
}
