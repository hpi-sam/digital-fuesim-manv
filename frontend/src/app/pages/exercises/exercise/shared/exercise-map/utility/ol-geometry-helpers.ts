import { Position } from 'digital-fuesim-manv-shared';
import type { Size, UUID } from 'digital-fuesim-manv-shared';
import { Feature } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import type { Geometry } from 'ol/geom';
import { Point, Polygon } from 'ol/geom';
import type { WithPosition } from '../../utility/types/with-position';

export interface PositionableElement {
    readonly id: UUID;
    readonly position: Position;
}

export type ResizableElement = PositionableElement & {
    size: Size;
};

export type GeometryWithCoordinates = Geometry & {
    getCoordinates: () => unknown;
    setCoordinates: (coordinates: any[]) => void;
};
/**
 * Typescript doesn't error when T doesn't satisfy
 * getCoordinates: () => unknown.
 * Instead, the inferred type is null. We exclude this type
 * to exchange it with never
 */
export type Coordinates<T extends GeometryWithCoordinates> = Exclude<
    ReturnType<T['getCoordinates']>,
    null
>;

type ArrayElement<ArrayType> = ArrayType extends readonly (infer ElementType)[]
    ? ElementType
    : never;

type SubstituteCoordinateForPoint<T> = T extends Coordinate
    ? Position
    : T extends Array<ArrayElement<T>>
    ? SubstituteCoordinateForPoint<ArrayElement<T>>[]
    : never;

export type Positions<T extends GeometryWithCoordinates> =
    SubstituteCoordinateForPoint<Coordinates<T>>;

export interface CoordinatePair<T extends GeometryWithCoordinates> {
    startPosition: Coordinates<T>;
    endPosition: Coordinates<T>;
}

export const createPoint = (element: WithPosition<any>): Feature<Point> =>
    new Feature(new Point(getCoordinatesPositionableElement(element)));

export const createPolygon = (element: ResizableElement): Feature<Polygon> =>
    new Feature(new Polygon([getCoordinateResizeableElement(element)]));

export const getCoordinatesPositionableElement = (
    element: PositionableElement
): Coordinate => [element.position.x, element.position.y];

export const getCoordinateResizeableElement = (
    element: ResizableElement
): Coordinate[] => [
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

export const interpolate = (
    startCoordinate: Coordinate,
    endCoordinate: Coordinate,
    lerpFactor: number
): Coordinate => [
    startCoordinate[0]! +
        (endCoordinate[0]! - startCoordinate[0]!) * lerpFactor,
    startCoordinate[1]! +
        (endCoordinate[1]! - startCoordinate[1]!) * lerpFactor,
];

export const getNextPositionPoint = (
    positions: CoordinatePair<Point>,
    progress: number
): Coordinates<Point> =>
    interpolate(positions.startPosition, positions.endPosition, progress);

export const getNextPositionPolygon = (
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

export const getPositionPoint = (feature: Feature<Point>): Positions<Point> =>
    Position.create(
        getCoordinatesPoint(feature)[0]!,
        getCoordinatesPoint(feature)[1]!
    );

export const getPositionPolygon = (
    feature: Feature<Polygon>
): Positions<Polygon> =>
    getCoordinatesPolygon(feature).map((polygon) =>
        polygon.map((position) => Position.create(position[0]!, position[1]!))
    );
