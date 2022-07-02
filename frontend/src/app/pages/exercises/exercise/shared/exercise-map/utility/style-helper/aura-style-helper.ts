import type { Feature } from 'ol';
import type { ColorLike } from 'ol/colorlike';
import { Circle, Style } from 'ol/style';
import Stroke from 'ol/style/Stroke';
import { StyleHelper } from './style-helper';

export class AuraStyleHelper extends StyleHelper<Style, Feature> {
    constructor(
        private readonly getCircleProperties: (feature: Feature) => {
            color: ColorLike;
            width: number;
            // TODO: make it non interactable - is also on top of e.g. patients
            // fillColor: ColorLike;
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
                // TODO: make it non interactable - is also on top of e.g. patients
                stroke: new Stroke({
                    color: this.getCircleProperties(feature).color,
                    width: this.getCircleProperties(feature).width,
                    lineDash: this.getCircleProperties(feature).lineDash,
                }),
                // TODO: make it non interactable - is also on top of e.g. patients
                // fill: new Fill({
                //     color: this.getCircleProperties(feature).fillColor,
                // }),
            }),
            // put it behind the personnel or material
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
