import type { Position, Size, UUID } from 'digital-fuesim-manv-shared';
import { isArray } from 'lodash-es';
import { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import { Point, Polygon } from 'ol/geom';
import type { WithPosition } from '../../utility/types/with-position';

export type PositionableElement = {
    readonly id: UUID;
    readonly position: Position;
}

export type ResizableElement = PositionableElement & {
    size: Size;
};

export type GeometryWithCoorindates = Geometry & {
    getCoordinates: () => unknown;
    setCoordinates: (coordinates: any[]) => void;
};
/**
 * Typescript doesn't error when T doesn't satisfy
 * getCoordinates: () => unknown.
 * Instead, the inferred type is null. We exclude this type
 * to exchange it to never
 */
export type Coordinates<T extends GeometryWithCoorindates> = Exclude<
    ReturnType<T['getCoordinates']>,
    null
>;

export type CoordinatePair<T extends GeometryWithCoorindates> = {
    startPosition: Coordinates<T>;
    endPosition: Coordinates<T>;
};

export const isPointFeature = (
    feature: Feature<Geometry>
): feature is Feature<Point> => feature.getGeometry()!.getType() === 'Point';

export const isPolygonFeature = (
    feature: Feature<Geometry>
): feature is Feature<Polygon> =>
    feature.getGeometry()!.getType() === 'Polygon';

export const isCoordinateOfPolygon = (
    coordinates: Coordinates<Point | Polygon>
): coordinates is Coordinates<Polygon> => isArray(coordinates[0]);

export const isCoordinatePairOfPolygon = (
    coordinatePair: CoordinatePair<Point | Polygon>
): coordinatePair is CoordinatePair<Polygon> =>
    isArray(coordinatePair.startPosition[0]);

export const createPoint = (element: WithPosition<any>): Feature<Point> =>
    new Feature(new Point([element.position.x, element.position.y]));

export const createPolygon = (element: ResizableElement): Feature<Polygon> =>
    new Feature(new Polygon([getCoordinateArray(element)]));

export const getCoordinateArray = (element: ResizableElement) => [
    [element.position.x, element.position.y],
    [element.position.x + element.size.width, element.position.y],
    [
        element.position.x + element.size.width,
        element.position.y - element.size.height,
    ],
    [element.position.x, element.position.y - element.size.height],
    [element.position.x, element.position.y],
];

export const getCoordinatesPoint = (
    feature: Feature<Point>
): Coordinates<Point> => feature.getGeometry()!.getCoordinates();

export const getCoordinatesPolygon = (
    feature: Feature<Polygon>
): Coordinates<Polygon> => feature.getGeometry()!.getCoordinates();

export const getCoordinatesPointOrPolygon = (
    feature: Feature<Point | Polygon>
) =>
    isPointFeature(feature)
        ? getCoordinatesPoint(feature)
        : getCoordinatesPolygon(feature as Feature<Polygon>);
