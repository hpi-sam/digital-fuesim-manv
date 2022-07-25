import type { Type } from '@angular/core';
import type { Feature } from 'ol';
import type { Point } from 'ol/geom';
import type OlMap from 'ol/Map';
import type { Pixel } from 'ol/pixel';
import { calculatePopupPositioning } from './calculate-popup-positioning';
import type { OpenPopupOptions, PopupComponent } from './popup-manager';

/**
 * Images in OpenLayers are {@link Point}s that have an icon style.
 * This means the geometry doesn't have a usable bounding box to determine how much the popup should be offset.
 * This class is a helper with a workaround to get the bounding box of the style.
 */
export class ImagePopupHelper {
    constructor(private readonly olMap: OlMap) {}

    public getPopupOptions<PopupComponentType extends PopupComponent>(
        component: Type<PopupComponentType>,
        feature: Feature<Point>,
        context: Partial<InstanceType<Type<PopupComponentType>>>
    ): OpenPopupOptions<any> {
        const featureCenter = feature.getGeometry()!.getCoordinates();
        const view = this.olMap.getView();
        const { position, positioning } = calculatePopupPositioning(
            featureCenter,
            this.getFeatureExtent(feature),
            view.getCenter()!
        );
        return {
            position,
            positioning,
            component,
            context,
        };
    }

    /**
     * @returns The approximate bounding box of the feature in pixels.
     *
     * The bounding box can be bigger if
     * - the feature is not the widest/highest at it's middle axis
     * - the feature has holes
     */
    private getFeatureExtent(feature: Feature<Point>): {
        width: number;
        height: number;
    } {
        // TODO: This is a workaround for the fact that the OpenLayers doesn't seem to provide a way to get the bounding box of an image
        const featureCoordinates = feature.getGeometry()!.getCoordinates();
        const featurePixel =
            this.olMap.getPixelFromCoordinate(featureCoordinates);
        // Go from the center of the point in each direction and check wether the feature is at this pixel.
        const pixelBoundingBox = {
            width: this.getIntervallLength(featurePixel[0]!, (x) =>
                this.hasFeatureAtPixel(feature, [x, featurePixel[1]!])
            ),
            height: this.getIntervallLength(featurePixel[1]!, (y) =>
                this.hasFeatureAtPixel(feature, [featurePixel[0]!, y])
            ),
        };
        return this.pixelToCoordinateBoundingBox(pixelBoundingBox, 1);
    }

    /**
     * @param middle a value for which {@link condition} is true
     * @param condition It is expected that the condition is only and always true in exactly one interval
     * e.g.: (0 = false, 1 = true)
     * Correct: 0000001111110000000, 11111111, 10 or 0000010000
     * Incorrect: 000000000000, 110000100000, 101
     * The distance between two values is always 1
     * @returns length of the interval between min and max where the condition is true
     */
    private getIntervallLength(
        middle: number,
        condition: (value: number) => boolean
    ): number {
        const bigStepSize = 20;
        const start = this.findLastValue(middle, -bigStepSize, -1, condition);
        const end = this.findLastValue(middle, bigStepSize, 1, condition);
        return end - start;
    }

    /**
     * @returns The number of the last value where the condition is still true
     */
    private findLastValue(
        start: number,
        bigStepSize: number,
        smallStepSize: number,
        condition: (value: number) => boolean
    ) {
        let lastValue = start;
        // Do big steps until you are over the point the condition turns false
        while (condition(lastValue + bigStepSize)) {
            lastValue += bigStepSize;
        }
        // Do small steps to reach the exact point
        while (condition(lastValue + smallStepSize)) {
            lastValue += smallStepSize;
        }
        return lastValue;
    }

    /**
     * @returns wether the feature is visible at the given pixel
     */
    private hasFeatureAtPixel(feature: Feature<Point>, pixel: Pixel): boolean {
        return this.olMap
            .getFeaturesAtPixel(pixel, {
                // We assume the feature has no holes and is on the two axis the highest
                hitTolerance: 0,
            })
            .some((_feature) => _feature.getId() === feature.getId());
    }

    /**
     * @param boundingBox in pixels
     * @returns the boundingBox in Coordinates
     */
    private pixelToCoordinateBoundingBox(
        boundingBox: {
            width: number;
            height: number;
        },
        padding: number
    ) {
        const zeroPixel = this.olMap.getCoordinateFromPixel([0, 0]);
        const coordinateExtend = {
            width:
                Math.abs(
                    zeroPixel[0]! -
                        this.olMap.getCoordinateFromPixel([
                            boundingBox.width,
                            0,
                        ])[0]!
                ) + padding,
            height:
                Math.abs(
                    zeroPixel[1]! -
                        this.olMap.getCoordinateFromPixel([
                            0,
                            boundingBox.height,
                        ])[1]!
                ) + padding,
        };
        return coordinateExtend;
    }
}
