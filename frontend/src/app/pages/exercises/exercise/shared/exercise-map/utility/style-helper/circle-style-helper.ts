import type { Feature } from 'ol';
import { Circle } from 'ol/style';
import type { Options } from 'ol/style/Circle';
import Style from 'ol/style/Style';
import { StyleHelper } from './style-helper';

export class CircleStyleHelper extends StyleHelper<Style, Feature> {
    constructor(
        private readonly getProperties: (
            feature: Feature
        ) => Options | undefined,
        private readonly scale: number
    ) {
        super();
    }

    protected generateInitialStyle(feature: Feature, zoom: number) {
        const properties = this.getProperties(feature);
        if (properties === undefined) {
            return new Style();
        }
        return new Style({
            image: new Circle(properties),
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
        const image = initialStyle.getImage();
        if (image !== undefined) {
            image.setScale(this.scale / zoom);
        }
        return initialStyle;
    }
}
