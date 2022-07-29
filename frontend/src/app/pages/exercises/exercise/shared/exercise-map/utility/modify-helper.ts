import { calculateDistance, Position } from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import type { LineString } from 'ol/geom';
import type { Modify } from 'ol/interaction';

function coordinateToPosition(coordinate: Coordinate): Position {
    return Position.create(coordinate[0]!, coordinate[1]!);
}

export type CornerName = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

function getNearestCoordinateName(
    referencePosition: Coordinate,
    coordinates: { [name in CornerName]: Coordinate }
): CornerName {
    if (Object.keys(coordinates).length === 0) {
        throw new TypeError('Expected at least one coordinate');
    }
    return Object.entries(coordinates)
        .map(
            ([name, coordinate]) =>
                [
                    name,
                    calculateDistance(
                        coordinateToPosition(referencePosition),
                        coordinateToPosition(coordinate)
                    ),
                ] as [CornerName, number]
        )
        .sort(
            ([, leftDistance], [, rightDistance]) =>
                leftDistance - rightDistance
        )
        .map(([name]) => name)[0]!;
}

export interface ModifyGeometry {
    geometry: LineString;
    modifyCorner: CornerName;
}

/**
 * Modifies (moves) a feature to a new position.
 */
export class ModifyHelper<T extends LineString = LineString> {
    /**
     * If a feature should make use of any of the helper functions in this class,
     * it's layer should have a modifyInteraction that is registered via this method.
     */
    public static registerModifyEvents<T extends LineString = LineString>(
        modifyInteraction: Modify
    ) {
        // These event don't propagate to anything else by default.
        // We therefore have to propagate them manually to the specific features.
        modifyInteraction.on('modifystart', (event) => {
            event.features.forEach((featureLike) => {
                const feature = featureLike as Feature;
                feature.dispatchEvent(event);
                const featureGeometry = feature.getGeometry() as T;
                const coordinates = featureGeometry.getCoordinates();
                // We need at least 4 coordinates
                if (coordinates.length < 4) {
                    throw new Error(
                        `Got unexpected short coordinates array: ${coordinates}`
                    );
                }
                const mousePosition = event.mapBrowserEvent.coordinate;
                const corner = getNearestCoordinateName(mousePosition, {
                    topLeft: coordinates[0]!,
                    topRight: coordinates[1]!,
                    bottomRight: coordinates[2]!,
                    bottomLeft: coordinates[3]!,
                });
                const modifyGeometry: ModifyGeometry = {
                    // We need to clone the geometry to be able to properly resize it
                    geometry: featureGeometry.clone(),
                    modifyCorner: corner,
                };
                feature.set('modifyGeometry', modifyGeometry, true);
            });
        });
        modifyInteraction.on('modifyend', (event) => {
            event.features.forEach((featureLike) => {
                const feature = featureLike as Feature;
                feature.dispatchEvent(event);
                const modifyGeometry = feature.get('modifyGeometry');
                if (modifyGeometry) {
                    feature.setGeometry(modifyGeometry.geometry);
                    feature.unset('modifyGeometry', true);
                }
            });
        });
    }

    public onModifyEnd(
        feature: Feature<T>,
        callback: (newCoordinates: Position[]) => void
    ) {
        feature.addEventListener('modifyend', (event) => {
            const modifyGeometry = feature.get(
                'modifyGeometry'
            ) as ModifyGeometry;
            // The end coordinates in the event are the mouse coordinates and not the feature coordinates.
            const coordinates = modifyGeometry.geometry.getCoordinates();
            callback(
                coordinates.map((coordinate) =>
                    Position.create(coordinate[0]!, coordinate[1]!)
                )
            );
        });
    }

    // TODO: add more functionality (highlighting, etc.)
}
