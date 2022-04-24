/* eslint-disable @typescript-eslint/naming-convention */
import type { Patient } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { Feature } from 'ol';
import type { WithPosition } from '../../utility/types/with-position';
import { PatientPopupComponent } from '../shared/patient-popup/patient-popup.component';
import { withPopup } from '../utility/with-popup';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { ElementFeatureManager, pointCreator } from './element-feature-manager';

class PatientFeatureManagerBase extends ElementFeatureManager<
    WithPosition<Patient>
> {
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
            pointCreator
        );
        this.layer.setStyle((feature, resolution) =>
            this.imageStyleHelper.getStyle(feature as Feature, resolution)
        );
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}

export const PatientFeatureManager = withPopup<
    WithPosition<Patient>,
    typeof PatientFeatureManagerBase,
    PatientPopupComponent
>(PatientFeatureManagerBase, {
    component: PatientPopupComponent,
    height: 110,
    width: 50,
    getContext: (feature) => ({ patientId: feature.getId() as string }),
});
