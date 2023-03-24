import {
    currentCoordinatesOf,
    MapCoordinates,
} from 'digital-fuesim-manv-shared';
import { Feature } from 'ol';
import { getCenter } from 'ol/extent';
import { Polygon } from 'ol/geom';
import type {
    CoordinatePair,
    Coordinates,
    GeometryHelper,
    ResizableElement,
} from './geometry-helper';
import { interpolate } from './geometry-helper';

export class PolygonGeometryHelper
    implements GeometryHelper<Polygon, ResizableElement>
{
    create = (element: ResizableElement): Feature<Polygon> =>
        new Feature(new Polygon(this.getElementCoordinates(element)));

    getElementCoordinates = (
        element: ResizableElement
    ): Coordinates<Polygon> => {
        const center = currentCoordinatesOf(element);
        const { width, height } = element.size;
        return [
            [
                // top left
                [center.x - width / 2, center.y + height / 2],
                // top right
                [center.x + width / 2, center.y + height / 2],
                // bottom right
                [center.x + width / 2, center.y - height / 2],
                // bottom left
                [center.x - width / 2, center.y - height / 2],
                // top left (close the rectangle)
                [center.x - width / 2, center.y + height / 2],
            ],
        ];
    };

    getFeatureCoordinates = (feature: Feature<Polygon>): Coordinates<Polygon> =>
        feature.getGeometry()!.getCoordinates();

    interpolateCoordinates = (
        positions: CoordinatePair<Polygon>,
        progress: number
    ): Coordinates<Polygon> =>
        positions.startPosition.map((coordinates, coordinatesIndex) =>
            coordinates.map((startCoordinate, coordinateIndex) =>
                interpolate(
                    startCoordinate,
                    positions.endPosition[coordinatesIndex]![coordinateIndex]!,
                    progress
                )
            )
        );

    getFeaturePosition = (feature: Feature<Polygon>) => {
        const centerCoordinates = getCenter(feature.getGeometry()!.getExtent());
        return MapCoordinates.create(
            centerCoordinates[0]!,
            centerCoordinates[1]!
        );
    };
}
