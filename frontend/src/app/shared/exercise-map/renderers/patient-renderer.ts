import type { Patient } from 'digital-fuesim-manv-shared';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Position } from 'digital-fuesim-manv-shared/dist/models/utils';
import { ElementRenderer } from './element-renderer';
import { MovementAnimator } from './movement-animator';
import { TranslateHelper } from './translate-helper';
import { ImageStyleHelper } from './get-image-style-function';

type CreatablePatient = Patient & { position: Position };
type PatientFeature = Feature<Point>;
type SupportedChangeProperties = ReadonlySet<'position'>;

export class PatientRenderer extends ElementRenderer<
    Patient,
    PatientFeature,
    CreatablePatient,
    SupportedChangeProperties
> {
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
        private readonly patientLayer: VectorLayer<VectorSource<Point>>,
        private readonly apiService: ApiService
    ) {
        super();
        this.patientLayer.setStyle((feature, resolution) =>
            this.imageStyleHelper.getStyle(
                feature as PatientFeature,
                resolution
            )
        );
    }

    canBeCreated(patient: Patient): patient is CreatablePatient {
        return !!patient.position;
    }

    createFeature(patient: CreatablePatient): void {
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

    deleteFeature(patient: Patient, patientFeature: PatientFeature): void {
        this.patientLayer.getSource().removeFeature(patientFeature);
        this.movementAnimator.stopMovementAnimation(patientFeature);
    }

    readonly supportedChangeProperties = new Set(['position'] as const);
    changeFeature(
        oldPatient: Patient,
        newPatient: CreatablePatient,
        changedProperties: SupportedChangeProperties,
        patientFeature: PatientFeature
    ): void {
        if (changedProperties.has('position')) {
            this.movementAnimator.animateFeatureMovement(patientFeature, [
                newPatient.position.x,
                newPatient.position.y,
            ]);
        }
    }

    getElementFeature(patient: Patient) {
        return this.patientLayer.getSource().getFeatureById(patient.id) as
            | PatientFeature
            | undefined;
    }
}
