import type { Personnel } from 'digital-fuesim-manv-shared';
import { normalZoom } from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import type Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import type { ApiService } from 'src/app/core/api.service';
import type { WithPosition } from '../../utility/types/with-position';
import { ImageStyleHelper } from '../utility/style-helper/image-style-helper';
import { NameStyleHelper } from '../utility/style-helper/name-style-helper';
import { createPoint, ElementFeatureManager } from './element-feature-manager';

export class PersonnelFeatureManager extends ElementFeatureManager<
    WithPosition<Personnel>
> {
    readonly type = 'personnel';
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

    constructor(
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Point>>,
        apiService: ApiService
    ) {
        super(
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
        ]);
    }

    override unsupportedChangeProperties = new Set(['id', 'image'] as const);
}
