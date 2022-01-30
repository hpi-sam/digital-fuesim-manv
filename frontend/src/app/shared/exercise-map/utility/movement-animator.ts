import type Geometry from 'ol/geom/Geometry';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type OlMap from 'ol/Map';
import type RenderEvent from 'ol/render/Event';
import type { Feature } from 'ol';
import { getVectorContext } from 'ol/render';
import type Point from 'ol/geom/Point';
import type { UUID } from 'digital-fuesim-manv-shared';
import { isEqual } from 'lodash-es';

/**
 * Animates the movement of a feature to a new position.
 */
export class MovementAnimator {
    /**
     * The time in milliseconds how long the moving animation should take
     */
    private readonly movementAnimationTime = 200;

    constructor(
        private readonly olMap: OlMap,
        private readonly layer: VectorLayer<VectorSource<Geometry>>
    ) {}

    /**
     * This map stores the listeners for each feature to be able to unsubscribe them.
     */
    private readonly animationListeners = new Map<
        UUID,
        (event: RenderEvent) => void
    >();

    /**
     * This method animates the movement of the feature from its current position to the given end position
     * by linearly interpolating it's position over the next {@link movementAnimationTime} milliseconds.
     *
     * If the feature is removed from the layer before the animation is finished, it is recommended to call {@link stopMovementAnimation}.
     */
    public animateFeatureMovement(
        feature: Feature<Point>,
        endPosition: [number, number]
    ) {
        const startTime = Date.now();
        const featureGeometry = feature.getGeometry()!;
        const startPosition = featureGeometry.getCoordinates() as [
            number,
            number
        ];
        // Stop an ongoing movement animation
        this.stopMovementAnimation(feature);
        // We don't have to animate this
        if (isEqual(startPosition, endPosition)) {
            return;
        }
        const listener = (event: RenderEvent) => {
            this.animationTick(
                event,
                startTime,
                startPosition,
                endPosition,
                feature
            );
        };
        this.animationListeners.set(this.getFeatureId(feature), listener);
        // The listener unsubscribes itself
        this.layer.on('postrender', listener);
        // Trigger the first animation tick
        this.olMap.render();
    }

    /**
     * This method should be called after each postrender event.
     * It sets the feature to the next interpolated position.
     */
    private animationTick(
        event: RenderEvent,
        startTime: number,
        startPosition: [number, number],
        endPosition: [number, number],
        feature: Feature<Point>
    ) {
        const featureGeometry = feature.getGeometry()!;
        const elapsedTime = event.frameState!.time - startTime;
        // A value between 0 and 1
        const progress = Math.max(
            Math.min(elapsedTime / this.movementAnimationTime, 1),
            0
        );
        // We should already be (nearly) at the end position
        if (progress >= 1) {
            this.stopMovementAnimation(feature);
            featureGeometry.setCoordinates(endPosition);
            this.olMap.render();
            return;
        }
        // The next position is calculated by a linear interpolation between the start and end position
        const nextPosition = [
            startPosition[0] + (endPosition[0] - startPosition[0]) * progress,
            startPosition[1] + (endPosition[1] - startPosition[1]) * progress,
        ];
        featureGeometry.setCoordinates(nextPosition);
        getVectorContext(event).drawGeometry(featureGeometry);
        this.olMap.render();
    }

    public stopMovementAnimation(feature: Feature<Point>) {
        const listenerId = this.getFeatureId(feature);
        if (!this.animationListeners.has(listenerId)) {
            return;
        }
        this.layer.un('postrender', this.animationListeners.get(listenerId!)!);
        this.animationListeners.delete(listenerId);
    }

    private getFeatureId(feature: Feature<Point>) {
        // TODO: handle features without an id
        return feature.getId()! as UUID;
    }
}
