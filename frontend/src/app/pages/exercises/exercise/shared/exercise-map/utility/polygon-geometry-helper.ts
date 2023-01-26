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
    create(element: ResizableElement): Feature<Polygon> {
        return new Feature(new Polygon(this.getElementCoordinates(element)));
    }

    getElementCoordinates(element: ResizableElement): Coordinates<Polygon> {
        return [
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
    }

    getFeatureCoordinates(feature: Feature<Polygon>): Coordinates<Polygon> {
        return feature.getGeometry()!.getCoordinates();
    }

    interpolateCoordinates(
        positions: CoordinatePair<Polygon>,
        progress: number
    ): Coordinates<Polygon> {
        return positions.startPosition.map((coordinates, coordinatesIndex) =>
            coordinates.map((startCoordinate, coordinateIndex) =>
                interpolate(
                    startCoordinate,
                    positions.endPosition[coordinatesIndex]![coordinateIndex]!,
                    progress
                )
            )
        );
    }

    getFeaturePosition(feature: Feature<Polygon>): Positions<Polygon> {
        return this.getFeatureCoordinates(feature).map((coordinates) =>
            coordinates.map((coordinate) =>
                Position.create(coordinate[0]!, coordinate[1]!)
            )
        );
    }
}
