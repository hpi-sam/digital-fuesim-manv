import type { Feature } from 'ol';
import { Circle, Fill, Stroke } from 'ol/style';
import Style from 'ol/style/Style';
import { StyleHelper } from './style-helper';

export class CircleStyleHelper extends StyleHelper<Style, Feature> {
    constructor(
        private readonly getProperties: (feature: Feature) => {
            color: string;
            displacement: number[];
        },
        private readonly radius: number,
        private readonly scale: number
    ) {
        super();
    }

    protected generateInitialStyle(feature: Feature, zoom: number) {
        const { color, displacement } = this.getProperties(feature);
        return new Style({
            image: new Circle({
                radius: this.radius,
                stroke: new Stroke({
                    color: 'white',
                    width: 1,
                }),
                fill: new Fill({
                    color,
                }),
                displacement,
            }),
        });
    }

    protected generateInitialStyleKey(feature: Feature, zoom: number) {
        return JSON.stringify(this.getProperties(feature));
    }

    protected adjustStyleToZoom(
        initialStyle: Style,
        zoom: number,
        feature: Feature
    ) {
        const image = initialStyle.getImage()!;
        image.setScale(this.scale / zoom);
        return initialStyle;
    }
}
