import type { Feature } from 'ol';
import type Point from 'ol/geom/Point';

export class TranslateHelper {
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
