import type { Patient } from 'digital-fuesim-manv-shared';
import { Feature } from 'ol';
import Circle from 'ol/geom/Circle';
import type Geometry from 'ol/geom/Geometry';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';

/**
 * provides an Api to render a
 */
export abstract class ElementRenderer<Element extends object> {
    abstract createElement(element: Element): void;
    abstract deleteElement(element: Element): void;

    public changeElement(oldElement: Element, newElement: Element): void {
        this.deleteElement(oldElement);
        this.createElement(newElement);
    }
}

export class PatientRenderer extends ElementRenderer<Patient> {
    constructor(
        private readonly patientLayer: VectorLayer<VectorSource<Geometry>>,
        private readonly apiService: ApiService
    ) {
        super();
    }

    public createElement(patient: Patient): void {
        const circleFeature = new Feature(
            new Circle([patient.position!.x, patient.position!.y], 10)
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
        this.patientLayer
            .getSource()
            .removeFeature(this.getPatientFeature(patient));
    }

    private getPatientFeature(patient: Patient): Feature<Geometry> {
        return this.patientLayer.getSource().getFeatureById(patient.id);
    }
}
