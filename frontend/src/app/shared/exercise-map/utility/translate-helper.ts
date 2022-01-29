import type { Feature } from 'ol';
import type Geometry from 'ol/geom/Geometry';
import type Point from 'ol/geom/Point';
import type { Translate } from 'ol/interaction';

/**
 * Translates (moves) a feature to a new position.
 */
export class TranslateHelper {
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
                event.features.forEach((feature: Feature<Geometry>) => {
                    feature.dispatchEvent(event);
                });
            });
        }
    }

    public onTranslateEnd(
        feature: Feature<Point>,
        callback: (newCoordinates: { x: number; y: number }) => void
    ) {
        // The translateend event is only called on features
        feature.addEventListener('translateend', (event) => {
            const [x, y] = feature.getGeometry()!.getCoordinates();
            callback({ x, y });
        });
    }

    // TODO: add more functionality (highlighting, etc.)
}
