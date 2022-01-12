import type { Patient } from 'digital-fuesim-manv-shared';
import { Feature } from 'ol';
import Circle from 'ol/geom/Circle';
import type Geometry from 'ol/geom/Geometry';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
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
        const circleFeature = new Feature(
            new Circle([patient.position.x, patient.position.y], 1)
        );
        circleFeature.setId(patient.id);
        this.patientLayer.getSource().addFeature(circleFeature);
        this.getPatientFeature(patient).addEventListener(
            'translateend',
            (event) => {
                const patientFeature = event.target as Feature<Circle>;

                const [x, y] = patientFeature.getGeometry()!.getCenter();
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

    private getPatientFeature(patient: Patient): Feature<Circle> {
        return this.patientLayer
            .getSource()
            .getFeatureById(patient.id) as Feature<Circle>;
    }
}
