import { Position } from 'digital-fuesim-manv-shared';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import type { WithPosition } from '../../utility/types/with-position';
import type {
    CoordinatePair,
    Coordinates,
    GeometryHelper,
    Positions,
} from './geometry-helper';
import { interpolate } from './geometry-helper';

export class PointGeometryHelper implements GeometryHelper<Point> {
    create(element: WithPosition<any>): Feature<Point> {
        return new Feature(new Point(this.getElementCoordinates(element)));
    }

    getElementCoordinates(element: WithPosition<any>): Coordinates<Point> {
        return [element.position.x, element.position.y];
    }

    getFeatureCoordinates(feature: Feature<Point>): Coordinates<Point> {
        return feature.getGeometry()!.getCoordinates();
    }

    getNextPosition(
        positions: CoordinatePair<Point>,
        progress: number
    ): Coordinates<Point> {
        return interpolate(
            positions.startPosition,
            positions.endPosition,
            progress
        );
    }

    getFeaturePosition(feature: Feature<Point>): Positions<Point> {
        return Position.create(
            this.getFeatureCoordinates(feature)[0]!,
            this.getFeatureCoordinates(feature)[1]!
        );
    }
}
