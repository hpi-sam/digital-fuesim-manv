import type { Personnel } from 'digital-fuesim-manv-shared';
import { normalZoom } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { Feature } from 'ol';
import Stroke from 'ol/style/Stroke';
import { getRgbaColor } from 'src/app/shared/functions/colors';
import type { WithPosition } from '../../utility/types/with-position';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { NameStyleHelper } from '../utility/style-helper/name-style-helper';
import { CircleStyleHelper } from '../utility/style-helper/circle-style-helper';
import { ElementFeatureManager, createPoint } from './element-feature-manager';

export class PersonnelFeatureManager extends ElementFeatureManager<
    WithPosition<Personnel>
> {
    private readonly imageStyleHelper = new ImageStyleHelper(
        (feature) => this.getElementFromFeature(feature)!.value.image
    );
    private readonly nameStyleHelper = new NameStyleHelper(
        (feature) => {
            const personnel = this.getElementFromFeature(feature)!.value;
            return {
                name: personnel.vehicleName,
                offsetY: personnel.image.height / 2 / normalZoom,
            };
        },
        0.025,
        'top'
    );

    // TODO: make it non interactable - is also on top of e.g. patients
    private readonly auraStyleHelper = new CircleStyleHelper((feature) => {
        const personnel = this.getElementFromFeature(feature)!.value;
        if (!personnel.auraMode) {
            return undefined;
        }
        return {
            stroke: new Stroke({
                color: getRgbaColor('white', 0.6),
                width: 5,
                lineDash: [0, 20, 20, 20],
            }),
            radius:
                Math.max(
                    personnel.specificThreshold,
                    personnel.generalThreshold
                ) / 0.025,
        };
    }, 0.025);

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
            (targetPosition, personnel) => {
                apiService.proposeAction({
                    type: '[Personnel] Move personnel',
                    personnelId: personnel.id,
                    targetPosition,
                });
            },
            createPoint
        );

        this.layer.setStyle((feature, resolution) =>
            this.getElementFromFeature(feature as Feature)!.value.auraMode
                ? [
                      this.nameStyleHelper.getStyle(
                          feature as Feature,
                          resolution
                      ),
                      this.imageStyleHelper.getStyle(
                          feature as Feature,
                          resolution
                      ),
                      this.auraStyleHelper.getStyle(
                          feature as Feature,
                          resolution
                      ),
                  ]
                : [
                      this.nameStyleHelper.getStyle(
                          feature as Feature,
                          resolution
                      ),
                      this.imageStyleHelper.getStyle(
                          feature as Feature,
                          resolution
                      ),
                  ]
        );
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}
