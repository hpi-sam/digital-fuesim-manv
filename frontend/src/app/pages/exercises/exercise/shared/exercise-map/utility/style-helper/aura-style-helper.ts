import type { Feature } from 'ol';
import type { ColorLike } from 'ol/colorlike';
import { Circle, Fill, Style } from 'ol/style';
import Stroke from 'ol/style/Stroke';
import { StyleHelper } from './style-helper';

export class AuraStyleHelper extends StyleHelper<Style, Feature> {
    constructor(
        private readonly getCircleProperties: (feature: Feature) => {
            color: ColorLike;
            width: number;
            fillColor: ColorLike;
            lineDash: number[];
            radius: number;
        },
        private readonly scale: number
    ) {
        super();
    }

    protected generateInitialStyle(feature: Feature, zoom: number) {
        return new Style({
            image: new Circle({
                radius: this.getCircleProperties(feature).radius,
                stroke: new Stroke({
                    color: this.getCircleProperties(feature).color,
                    width: this.getCircleProperties(feature).width,
                    lineDash: this.getCircleProperties(feature).lineDash,
                }),
                fill: new Fill({
                    color: this.getCircleProperties(feature).fillColor,
                }),
            }),
            zIndex: 0,
        });
    }

    protected generateInitialStyleKey(feature: Feature, zoom: number) {
        return JSON.stringify(this.getCircleProperties(feature));
    }

    protected adjustStyleToZoom(
        initialStyle: Style,
        zoom: number,
        feature: Feature
    ) {
        const image = initialStyle.getImage();
        image.setScale(this.scale / zoom);
        return initialStyle;
    }
}
