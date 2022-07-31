import type { Feature } from 'ol';
import type { Options } from 'ol/style/Stroke';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { StyleHelper } from './style-helper';

export class LineStyleHelper extends StyleHelper<Style, Feature> {
    constructor(
        private readonly getProperties: Options,
        private readonly scale: number
    ) {
        super();
    }

    protected generateInitialStyle(feature: Feature, zoom: number) {
        return new Style({
            stroke: new Stroke(this.getProperties),
        });
    }

    protected generateInitialStyleKey(feature: Feature, zoom: number) {
        // we only have one style
        return '';
    }

    protected adjustStyleToZoom(
        initialStyle: Style,
        zoom: number,
        feature: Feature
    ) {
        const stroke = initialStyle.getStroke()!;
        stroke.setWidth(this.scale / zoom);
        return initialStyle;
    }
}
