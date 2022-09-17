import type { Feature } from 'ol';
import type { Options } from 'ol/style/Stroke';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { StyleHelper } from './style-helper';

export class LineStyleHelper extends StyleHelper<Style, Feature> {
    /**
     * @param getOptions returns options that can be adjusted for each feature
     * @param width the width of the line (in a non standardized unit).
     */
    constructor(
        private readonly getOptions: (
            feature: Feature
            // The width in the options would only be respected
        ) => Exclude<Options, { width: any }>,
        private readonly width: number
    ) {
        super();
    }

    protected generateInitialStyle(feature: Feature, zoom: number) {
        return new Style({
            stroke: new Stroke(this.getOptions(feature)),
        });
    }

    protected generateInitialStyleKey(feature: Feature, zoom: number) {
        return JSON.stringify(this.getOptions(feature));
    }

    protected adjustStyleToZoom(
        initialStyle: Style,
        zoom: number,
        feature: Feature
    ) {
        const stroke = initialStyle.getStroke()!;
        // It is not possible to use stroke.getWidth() here because this function mutates the style object
        // -> the next width would be different from the initial one
        stroke.setWidth(this.width / zoom);
        return initialStyle;
    }
}
