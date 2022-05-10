import type { Patient } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { Feature, MapBrowserEvent } from 'ol';
import type { WithPosition } from '../../utility/types/with-position';
import { PatientPopupComponent } from '../shared/patient-popup/patient-popup.component';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { ImagePopupHelper } from '../utility/popup-helper';
import { ElementFeatureManager, createPoint } from './element-feature-manager';

export class PatientFeatureManager extends ElementFeatureManager<
    WithPosition<Patient>
> {
    private readonly popupHelper = new ImagePopupHelper(this.olMap);

    private readonly imageStyleHelper = new ImageStyleHelper(
        (feature) => this.getElementFromFeature(feature)!.value.image
    );

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
            (targetPosition, patient) => {
                apiService.proposeAction({
                    type: '[Patient] Move patient',
                    patientId: patient.id,
                    targetPosition,
                });
            },
            createPoint
        );
        this.layer.setStyle((feature, resolution) =>
            this.imageStyleHelper.getStyle(feature as Feature, resolution)
        );
    }

    public override onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<any>
    ): void {
        super.onFeatureClicked(event, feature);

        this.togglePopup$.next(
            this.popupHelper.getPopupOptions(PatientPopupComponent, feature, {
                patientId: feature.getId() as string,
            })
        );
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}
