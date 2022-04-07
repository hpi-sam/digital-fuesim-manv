/* eslint-disable @typescript-eslint/naming-convention */
import type { Patient } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { WithPosition } from '../../utility/types/with-position';
import { PatientPopupComponent } from '../shared/patient-popup/patient-popup.component';
import { withPopup } from '../utility/with-popup';
import { withElementImageStyle } from '../utility/with-element-image-style';
import { ElementFeatureManager } from './element-feature-manager';

class PatientFeatureManagerBase extends ElementFeatureManager<
    WithPosition<Patient>
> {
    constructor(
        store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        apiService: ApiService
    ) {
        super(store, olMap, layer, (targetPosition, patient) => {
            apiService.proposeAction({
                type: '[Patient] Move patient',
                patientId: patient.id,
                targetPosition,
            });
        });
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}

const PatientFeatureManagerWithImageStyle = withElementImageStyle<
    WithPosition<Patient>
>(PatientFeatureManagerBase);

export const PatientFeatureManager = withPopup<
    WithPosition<Patient>,
    typeof PatientFeatureManagerWithImageStyle
>(PatientFeatureManagerWithImageStyle, {
    component: PatientPopupComponent,
    height: 110,
    width: 50,
    getContext: (feature) => ({ patientId: feature.getId()! }),
});
