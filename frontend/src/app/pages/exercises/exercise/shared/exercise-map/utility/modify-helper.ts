import { Position } from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import type { FeatureLike } from 'ol/Feature';
import type { LineString } from 'ol/geom';
import type Point from 'ol/geom/Point';
import type { Modify } from 'ol/interaction';

function calculateDistance(a: Coordinate, b: Coordinate) {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

export interface ModifyGeometry {
    geometry: LineString;
    modifyCorner: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
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
        const modifyEvents = ['modifystart', 'modifyend'] as const;
        for (const eventName of modifyEvents) {
            modifyInteraction.on(eventName, (event) => {
                event.features.forEach((featureLike: FeatureLike) => {
                    const feature = featureLike as Feature;
                    feature.dispatchEvent(event);
                    switch (eventName) {
                        case 'modifystart':
                            {
                                const coordinates = (
                                    feature.getGeometry() as T
                                ).getCoordinates();
                                const mousePosition =
                                    event.mapBrowserEvent.coordinate;
                                let corner = 'topLeft';
                                let distance = calculateDistance(
                                    mousePosition,
                                    coordinates[0]
                                );
                                for (let i = 1; i <= 3; i++) {
                                    const newDistance = calculateDistance(
                                        mousePosition,
                                        coordinates[i]
                                    );
                                    if (newDistance < distance) {
                                        distance = newDistance;
                                        switch (i) {
                                            case 1:
                                                corner = 'topRight';
                                                break;
                                            case 2:
                                                corner = 'bottomRight';
                                                break;
                                            case 3:
                                                corner = 'bottomLeft';
                                                break;
                                        }
                                    }
                                }
                                feature.set(
                                    'modifyGeometry',
                                    {
                                        geometry: feature
                                            .getGeometry()!
                                            .clone(),
                                        modifyCorner: corner,
                                    } as ModifyGeometry,
                                    true
                                );
                            }
                            break;
                        case 'modifyend':
                            {
                                const modifyGeometry =
                                    feature.get('modifyGeometry');
                                if (modifyGeometry) {
                                    feature.setGeometry(
                                        modifyGeometry.geometry
                                    );
                                    feature.unset('modifyGeometry', true);
                                }
                            }
                            break;
                    }
                });
            });
        }
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
            const coordinates = modifyGeometry.geometry!.getCoordinates();
            callback(
                (coordinates as Coordinate[]).map((coordinate) =>
                    Position.create(coordinate[0], coordinate[1])
                ) as T extends Point ? never : Position[]
            );
        });
    }

    // TODO: add more functionality (highlighting, etc.)
}
