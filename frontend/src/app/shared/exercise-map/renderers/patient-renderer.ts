import type { Patient } from 'digital-fuesim-manv-shared';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import type Geometry from 'ol/geom/Geometry';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { hasAPropertyChanged } from '../utility/has-a-property-changed';
import { ElementRenderer } from './element-renderer';
import { MovementAnimator } from './movement-animator';

export class PatientRenderer extends ElementRenderer<Patient> {
    private readonly movementAnimator = new MovementAnimator(
        this.olMap,
        this.patientLayer
    );

    constructor(
        private readonly olMap: OlMap,
        private readonly patientLayer: VectorLayer<VectorSource<Geometry>>,
        private readonly apiService: ApiService
    ) {
        super();
    }

    public createElement(patient: Patient): void {
        if (!patient.position) {
            return;
        }
        const patientFeature = new Feature(
            new Point([patient.position.x, patient.position.y])
        );
        patientFeature.setId(patient.id);
        patientFeature.setStyle((feature, resolution) =>
            this.getStyle(feature as Feature<Geometry>, resolution)
        );
        this.patientLayer.getSource().addFeature(patientFeature);
        this.getPatientFeature(patient).addEventListener(
            'translateend',
            (event) => {
                const feature = event.target as Feature<Point>;

                const [x, y] = feature.getGeometry()!.getCoordinates();
                this.apiService.proposeAction(
                    {
                        type: '[Patient] Move patient',
                        patientId: patient.id,
                        position: { x, y },
                    },
                    true
                );
            }
        );
    }

    public deleteElement(patient: Patient): void {
        const patientFeature = this.getPatientFeature(patient);
        this.patientLayer.getSource().removeFeature(patientFeature);
        this.movementAnimator.stopMovementAnimation(patientFeature);
    }

    public override changeElement(
        oldPatient: Patient,
        newPatient: Patient
    ): void {
        if (
            !hasAPropertyChanged<Patient>(oldPatient, newPatient, ['position'])
        ) {
            const newPatientPosition = newPatient.position;

            if (newPatientPosition === undefined) {
                // the patient is not visible on the map
                this.deleteElement(oldPatient);
                return;
            }
            this.movementAnimator.animateFeatureMovement(
                this.getPatientFeature(newPatient),
                [newPatientPosition.x, newPatientPosition.y]
            );
            return;
        }
        super.changeElement(oldPatient, newPatient);
    }

    private getPatientFeature(patient: Patient): Feature<Point> {
        return this.patientLayer
            .getSource()
            .getFeatureById(patient.id) as Feature<Point>;
    }

    private readonly imageStyle = new Style({
        image: new Icon({
            src: 'https://svgsilh.com/svg/2098868.svg',
        }),
    });

    private readonly normalizedImageSize = 80;
    // This function should be as efficient as possible, because it is called per feature on each rendered frame
    private getStyle(feature: Feature<Geometry>, resolution: number) {
        const featureGeometry = feature.getGeometry() as Point;
        // TODO: cache the point per feature and only update its coordinates
        // We have to create a new Point and can't reuse it because else the you can't select the image
        this.imageStyle.setGeometry(
            new Point(featureGeometry.getCoordinates())
        );
        const image = this.imageStyle.getImage();
        // Normalize the image size
        const normalizedImageScale =
            this.normalizedImageSize / (image.getImageSize()?.[1] ?? 1);
        const newScale = normalizedImageScale / (resolution * 23);
        if (image.getScale() !== newScale) {
            // Make sure the image is always the same size on the map
            image.setScale(newScale);
        }
        return this.imageStyle;
    }
}
