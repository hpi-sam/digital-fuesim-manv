import type { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { Patient } from 'digital-fuesim-manv-shared';
import type { Feature, MapBrowserEvent } from 'ol';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import { Fill, Stroke } from 'ol/style';
import type { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { selectConfiguration } from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { WithPosition } from '../../utility/types/with-position';
import { PatientPopupComponent } from '../shared/patient-popup/patient-popup.component';
import { ImagePopupHelper } from '../utility/popup-helper';
import { CircleStyleHelper } from '../utility/style-helper/circle-style-helper';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { createPoint, ElementFeatureManager } from './element-feature-manager';

export class PatientFeatureManager extends ElementFeatureManager<
    WithPosition<Patient>
> {
    readonly type = 'patients';
    private readonly popupHelper = new ImagePopupHelper(this.olMap);

    private readonly imageStyleHelper = new ImageStyleHelper((feature) => {
        const patient = this.getElementFromFeature(feature)!.value;
        return {
            ...patient.image,
            rotation: patient.pretriageInformation.isWalkable
                ? undefined
                : (3 * Math.PI) / 2,
        };
    });

    private readonly circleStyleHelper = new CircleStyleHelper((feature) => {
        const patient = this.getElementFromFeature(feature)!.value;
        const configuration = selectStateSnapshot(
            selectConfiguration,
            this.store
        );
        const color = Patient.getVisibleStatus(
            patient,
            configuration.pretriageEnabled,
            configuration.bluePatientsEnabled
        );
        return {
            radius: 8,
            fill: new Fill({
                color,
            }),
            stroke: new Stroke({
                color: 'white',
                width: 1,
            }),
            displacement: patient.pretriageInformation.isWalkable
                ? [0, 20]
                : [-20, 0],
        };
    }, 0.025);

    constructor(
        private readonly store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        exerciseService: ExerciseService
    ) {
        super(
            olMap,
            layer,
            (targetPosition, patient) => {
                exerciseService.proposeAction({
                    type: '[Patient] Move patient',
                    patientId: patient.id,
                    targetPosition,
                });
            },
            createPoint
        );
        this.layer.setStyle((feature, resolution) => [
            this.imageStyleHelper.getStyle(feature as Feature, resolution),
            this.circleStyleHelper.getStyle(feature as Feature, resolution),
        ]);
    }

    public override onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<any>
    ): void {
        super.onFeatureClicked(event, feature);

        this.togglePopup$.next(
            this.popupHelper.getPopupOptions(PatientPopupComponent, feature, {
                patientId: feature.getId() as UUID,
            })
        );
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}
