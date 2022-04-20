import { Position } from 'digital-fuesim-manv-shared';
import { isArray } from 'lodash';
import type { Feature } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import type { FeatureLike } from 'ol/Feature';
import type { LineString } from 'ol/geom';
import type Point from 'ol/geom/Point';
import type { Modify } from 'ol/interaction';

/**
 * Modifies (moves) a feature to a new position.
 */
export class ModifyHelper<T extends LineString | Point = LineString> {
    /**
     * If a feature should make use of any of the helper functions in this class,
     * it's layer should have a modifyInteraction that is registered via this method.
     */
    public static registerModifyEvents(modifyInteraction: Modify) {
        // These event don't propagate to anything else by default.
        // We therefore have to propagate them manually to the specific features.
        const modifyEvents = ['modifystart', 'modifyend'] as const;
        for (const eventName of modifyEvents) {
            modifyInteraction.on(eventName, (event) => {
                event.features.forEach((feature: FeatureLike) => {
                    // @ts-expect-error TS doesn't know the typings
                    feature.dispatchEvent(event);
                    switch (eventName) {
                        case 'modifystart':
                            // @ts-expect-error TS doesn't know the typings
                            feature.set(
                                'modifyGeometry',
                                {
                                    // @ts-expect-error TS doesn't know the typings
                                    geometry: feature.getGeometry()!.clone(),
                                },
                                true
                            );

                            break;
                        case 'modifyend':
                            {
                                const modifyGeometry =
                                    feature.get('modifyGeometry');
                                if (modifyGeometry) {
                                    // @ts-expect-error TS doesn't know the typings
                                    feature.setGeometry(
                                        modifyGeometry.geometry
                                    );
                                    // @ts-expect-error TS doesn't know the typings
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
        feature: Feature<T extends Point ? Point : LineString>,
        callback: (
            newCoordinates: T extends Point ? Position : Position[]
        ) => void
    ) {
        feature.addEventListener('modifyend', (event) => {
            // The end coordinates in the event are the mouse coordinates and not the feature coordinates.
            const coordinates = feature.getGeometry()!.getCoordinates();
            if (isArray(coordinates[0])) {
                callback(
                    // @ts-expect-error 2345
                    (coordinates as Coordinate[]).map((coordinate) =>
                        Position.create(coordinate[0], coordinate[1])
                    )
                );
                return;
            }
            callback(
                // @ts-expect-error 2345
                Position.create(
                    (coordinates as Coordinate)[0],
                    (coordinates as Coordinate)[1]
                )
            );
        });
    }

    // TODO: add more functionality (highlighting, etc.)
}
