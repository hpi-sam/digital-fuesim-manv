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
import type { ColorLike } from 'ol/colorlike';
import type { WithPosition } from '../../utility/types/with-position';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { NameStyleHelper } from '../utility/style-helper/name-style-helper';
import { AuraStyleHelper } from '../utility/style-helper/aura-style-helper';
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

    private readonly auraStyleHelper = new AuraStyleHelper((feature) => {
        const personnel = this.getElementFromFeature(feature)!.value;
        return personnel.auraMode
            ? {
                  color: 'rgba(255, 255, 255, 0.6)' as ColorLike,
                  width: 5,
                  fillColor: 'rgba(255, 255, 255, 0.1)' as ColorLike,
                  lineDash: [0, 20, 20, 20],
                  radius: 200,
              }
            : {
                  color: 'rgba(0, 0, 0, 0)' as ColorLike,
                  width: 0,
                  fillColor: 'rgba(0, 0, 0, 0)' as ColorLike,
                  lineDash: [0],
                  radius: 0,
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

        this.layer.setStyle((feature, resolution) => [
            this.nameStyleHelper.getStyle(feature as Feature, resolution),
            this.imageStyleHelper.getStyle(feature as Feature, resolution),
            this.auraStyleHelper.getStyle(feature as Feature, resolution),
        ]);
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}
