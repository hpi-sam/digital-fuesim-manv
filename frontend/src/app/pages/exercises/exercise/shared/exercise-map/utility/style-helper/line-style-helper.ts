import type { Feature } from 'ol';
import type { ColorLike } from 'ol/colorlike';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { StyleHelper } from './style-helper';

export class LineStyleHelper extends StyleHelper<Style, Feature> {
    constructor(
        private readonly scale: number,
        private readonly color: ColorLike
    ) {
        super();
    }

    protected generateInitialStyle(feature: Feature, zoom: number) {
        return new Style({
            stroke: new Stroke({
                color: this.color,
            }),
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
