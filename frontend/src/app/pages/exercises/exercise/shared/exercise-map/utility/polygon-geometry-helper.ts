import { Position } from 'digital-fuesim-manv-shared';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import type {
    CoordinatePair,
    Coordinates,
    GeometryHelper,
    Positions,
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
    ): Coordinates<Polygon> => [
        [
            [element.position.x, element.position.y],
            [element.position.x + element.size.width, element.position.y],
            [
                element.position.x + element.size.width,
                element.position.y - element.size.height,
            ],
            [element.position.x, element.position.y - element.size.height],
            [element.position.x, element.position.y],
        ],
    ];

    getFeatureCoordinates = (feature: Feature<Polygon>): Coordinates<Polygon> =>
        feature.getGeometry()!.getCoordinates();

    getNextPosition = (
        positions: CoordinatePair<Polygon>,
        progress: number
    ): Coordinates<Polygon> =>
        positions.startPosition.map((polygon, polygonIndex) =>
            polygon.map((startPos, positionIndex) =>
                interpolate(
                    startPos,
                    positions.endPosition[polygonIndex]![positionIndex]!,
                    progress
                )
            )
        );

    getFeaturePosition = (feature: Feature<Polygon>): Positions<Polygon> =>
        this.getFeatureCoordinates(feature).map((polygon) =>
            polygon.map((position) =>
                Position.create(position[0]!, position[1]!)
            )
        );
}
