import type { Type, NgZone } from '@angular/core';
import type { Store } from '@ngrx/store';
import type { Material, UUID } from 'digital-fuesim-manv-shared';
import { normalZoom } from 'digital-fuesim-manv-shared';
import type { Feature, MapBrowserEvent } from 'ol';
import type OlMap from 'ol/Map';
import type { Subject } from 'rxjs';
import type { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { selectVisibleMaterials } from 'src/app/state/application/selectors/shared.selectors';
import { MaterialPopupComponent } from '../shared/material-popup/material-popup.component';
import type { OlMapInteractionsManager } from '../utility/ol-map-interactions-manager';
import { PointGeometryHelper } from '../utility/point-geometry-helper';
import { ImagePopupHelper } from '../utility/popup-helper';
import type { OpenPopupOptions } from '../utility/popup-manager';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { NameStyleHelper } from '../utility/style-helper/name-style-helper';
import { MoveableFeatureManager } from './moveable-feature-manager';

export class MaterialFeatureManager extends MoveableFeatureManager<Material> {
    public register(
        changePopup$: Subject<OpenPopupOptions<any, Type<any>> | undefined>,
        destroy$: Subject<void>,
        ngZone: NgZone,
        mapInteractionsManager: OlMapInteractionsManager
    ): void {
        super.registerFeatureElementManager(
            this.store.select(selectVisibleMaterials),
            changePopup$,
            destroy$,
            ngZone,
            mapInteractionsManager
        );
    }
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
        private readonly store: Store<AppState>,
        exerciseService: ExerciseService
    ) {
        super(
            olMap,
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
