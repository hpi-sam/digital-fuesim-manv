import { Position } from 'digital-fuesim-manv-shared';
import { isArray } from 'lodash';
import type { Feature } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import type { LineString } from 'ol/geom';
import type Point from 'ol/geom/Point';
import type { Translate } from 'ol/interaction';

/**
 * Translates (moves) a feature to a new position.
 */
export class TranslateHelper<T extends LineString | Point = Point> {
    /**
     * If a feature should make use of any of the helper functions in this class,
     * it's layer should have a translateInteraction that is registered via this method.
     */
    public static registerTranslateEvents(translateInteraction: Translate) {
        // These event don't propagate to anything else by default.
        // We therefore have to propagate them manually to the specific features.
        const translateEvents = [
            'translatestart',
            'translating',
            'translateend',
        ] as const;
        for (const eventName of translateEvents) {
            translateInteraction.on(eventName, (event) => {
                event.features.forEach((feature: Feature) => {
                    feature.dispatchEvent(event);
                });
            });
        }
    }

    public onTranslateEnd(
        feature: Feature<T extends Point ? Point : LineString>,
        callback: (
            newCoordinates: T extends Point ? Position : Position[]
        ) => void
    ) {
        feature.addEventListener('translateend', (event) => {
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
