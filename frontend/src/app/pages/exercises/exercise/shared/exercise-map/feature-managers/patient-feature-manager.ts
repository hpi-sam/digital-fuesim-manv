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
import { ElementFeatureManager } from './element-feature-manager';

export class PatientFeatureManagerBase extends ElementFeatureManager<
    WithPosition<Patient>
> {
    public static normalizedImageHeight = 80;

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
                imageHeight: PatientFeatureManager.normalizedImageHeight,
                imageUrl: './assets/patient.svg',
            },
            (targetPosition, patient) => {
                apiService.proposeAction({
                    type: '[Patient] Move patient',
                    patientId: patient.id,
                    targetPosition,
                });
            }
        );
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PatientFeatureManager = withPopup(PatientFeatureManagerBase, {
    component: PatientPopupComponent,
    height: 110,
    width: 50,
    getContext: (feature) => ({ patientId: feature.getId()! }),
});
