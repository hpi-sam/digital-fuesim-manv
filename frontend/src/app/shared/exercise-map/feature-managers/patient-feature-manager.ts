import type { Patient } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import { CommonFeatureManager } from './common-feature-manager';

export class PatientFeatureManager extends CommonFeatureManager<Patient> {
    constructor(
        olMap: OlMap,
        patientLayer: VectorLayer<VectorSource<Point>>,
        private readonly apiService: ApiService
    ) {
        super(
            olMap,
            patientLayer,
            {
                imageHeight: 80,
                imageUrl: 'https://svgsilh.com/svg/2098868.svg',
            },
            (newPosition, patient) => {
                this.apiService.proposeAction({
                    type: '[Patient] Move patient',
                    patientId: patient.id,
                    position: newPosition,
                });
            }
        );
    }
}
