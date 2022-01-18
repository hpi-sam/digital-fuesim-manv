import type { Patient } from 'digital-fuesim-manv-shared';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import type Geometry from 'ol/geom/Geometry';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import { ElementRenderer } from './element-renderer';
import { MovementAnimator } from './movement-animator';
import { TranslateHelper } from './translate-helper';
import { ImageStyleHelper } from './get-image-style-function';

export class PatientRenderer extends ElementRenderer<Patient> {
    /**
     * The height of the image in pixels that should be used at {@link normalZoom } zoom
     */
    private static readonly height = 80;
    private readonly movementAnimator = new MovementAnimator(
        this.olMap,
        this.patientLayer
    );
    private readonly translateHelper = new TranslateHelper();
    private readonly imageStyleHelper = new ImageStyleHelper(
        'https://svgsilh.com/svg/2098868.svg',
        PatientRenderer.height
    );

    constructor(
        private readonly olMap: OlMap,
        private readonly patientLayer: VectorLayer<VectorSource<Geometry>>,
        private readonly apiService: ApiService
    ) {
        super();
        this.patientLayer.setStyle((feature, resolution) =>
            this.imageStyleHelper.getStyle(
                feature as Feature<Geometry>,
                resolution
            )
        );
    }

    public createElement(patient: Patient): void {
        if (!patient.position) {
            return;
        }
        const patientFeature = new Feature(
            new Point([patient.position.x, patient.position.y])
        );
        patientFeature.setId(patient.id);
        this.patientLayer.getSource().addFeature(patientFeature);
        this.translateHelper.onTranslateEnd(patientFeature, ({ x, y }) => {
            this.apiService.proposeAction(
                {
                    type: '[Patient] Move patient',
                    patientId: patient.id,
                    position: { x, y },
                },
                true
            );
        });
    }

    public deleteElement(patient: Patient): void {
        const patientFeature = this.getPatientFeature(patient);
        if (!patientFeature) {
            return;
        }
        this.patientLayer.getSource().removeFeature(patientFeature);
        this.movementAnimator.stopMovementAnimation(patientFeature);
    }

    readonly supportedChangeProperties = ['position'] as const;
    customizedChangeElement(
        oldPatient: Patient,
        newPatient: Patient,
        changedProperties: Set<keyof Patient>
    ): void {
        const newPosition = newPatient.position;
        const patientFeature = this.getPatientFeature(oldPatient);
        if (!newPosition) {
            // the patient is not visible on the map
            this.deleteElement(oldPatient);
            return;
        }
        if (!patientFeature) {
            // the patient is not yet rendered
            this.createElement(newPatient);
            return;
        }
        if (changedProperties.has('position')) {
            this.movementAnimator.animateFeatureMovement(patientFeature, [
                newPosition.x,
                newPosition.y,
            ]);
        }
        // TODO: handle other properties
    }

    private getPatientFeature(patient: Patient) {
        return this.patientLayer.getSource().getFeatureById(patient.id) as
            | Feature<Point>
            | undefined;
    }
}
