import type { Patient } from 'digital-fuesim-manv-shared';
import { Feature } from 'ol';
import Circle from 'ol/geom/Circle';
import type Geometry from 'ol/geom/Geometry';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import { getVectorContext } from 'ol/render';
import type OlMap from 'ol/Map';
import type RenderEvent from 'ol/render/Event';

/**
 * Provides an Api to render an element
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
        private readonly olMap: OlMap,
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

    public override changeElement(
        oldPatient: Patient,
        newPatient: Patient
    ): void {
        // TODO: check if only the position has changed
        const newPatientPosition = newPatient.position;
        if (
            oldPatient.position !== newPatient.position &&
            oldPatient.personalInformation === newPatient.personalInformation &&
            newPatientPosition !== undefined
        ) {
            //
            this.animateFeatureMovement(this.getPatientFeature(newPatient), [
                newPatientPosition.x,
                newPatientPosition.y,
            ]);
            return;
        }
        super.changeElement(oldPatient, newPatient);
    }

    private getPatientFeature(patient: Patient): Feature<Circle> {
        return this.patientLayer
            .getSource()
            .getFeatureById(patient.id) as Feature<Circle>;
    }

    /**
     * The time in milliseconds how long the moving animation should take
     */
    private readonly movementAnimationTime = 100;

    private animateFeatureMovement(
        feature: Feature<Circle>,
        endPosition: [number, number]
    ) {
        const startTime = Date.now();
        const featureGeometry = feature.getGeometry()!;
        const startPosition = featureGeometry.getCenter() as [number, number];
        const listener = (event: RenderEvent) => {
            this.animationTick(
                event,
                startTime,
                startPosition,
                endPosition,
                featureGeometry
            );
        };
        this.patientLayer.on('postrender', listener);
        this.olMap.render();
        // TODO: remove listener when another movement animation for it is started
        setTimeout(() => {
            this.patientLayer.un('postrender', listener);
            // Sometimes the position is not correctly updated in the postrender listener
            featureGeometry.setCenter(endPosition);
        }, this.movementAnimationTime);
    }

    private animationTick(
        event: RenderEvent,
        startTime: number,
        startPosition: [number, number],
        endPosition: [number, number],
        featureGeometry: Circle
    ) {
        const elapsedTime = event.frameState!.time - startTime;
        // A value between 0 and 1
        const progress = Math.max(
            Math.min(elapsedTime / this.movementAnimationTime, 1),
            0
        );
        // We should already be (nearly) at the end position
        if (progress >= 1) {
            return;
        }
        // The next position is calculated by a linear interpolation between the start and end position
        const nextPosition = [
            startPosition[0] + (endPosition[0] - startPosition[0]) * progress,
            startPosition[1] + (endPosition[1] - startPosition[1]) * progress,
        ];
        featureGeometry.setCenter(nextPosition);
        getVectorContext(event).drawGeometry(featureGeometry);
        this.olMap.render();
    }
}
