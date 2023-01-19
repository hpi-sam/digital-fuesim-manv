import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type OlMap from 'ol/Map';
import type RenderEvent from 'ol/render/Event';
import type { Feature } from 'ol';
import { getVectorContext } from 'ol/render';
import type Point from 'ol/geom/Point';
import type { UUID } from 'digital-fuesim-manv-shared';
import { isEqual } from 'lodash-es';
import type { Geometry, Polygon } from 'ol/geom';
import type { Coordinate } from 'ol/coordinate';
import {
    Coordinates,
    CoordinatePair,
    isPointFeature,
    isPolygonFeature,
    getCoordinatesPointOrPolygon,
    GeometryWithCoorindates} from './ol-geometry-helpers';
import {
    isCoordinatePairOfPolygon,
} from './ol-geometry-helpers';

/**
 * Animates the movement of a feature to a new position.
 */
export class MovementAnimator<T extends GeometryWithCoorindates> {
    /**
     * The time in milliseconds how long the moving animation should take
     */
    private readonly movementAnimationTime = 200;

    constructor(
        private readonly olMap: OlMap,
        private readonly layer: VectorLayer<VectorSource>
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
        feature: Feature<T>,
        endPosition: Coordinates<T>
    ) {
        if (!isPointFeature(feature) && !isPolygonFeature(feature)) {
            console.error(`Unexpected animation type: ${feature.getGeometry()!.getType()}`)
            return;
        }

        const startTime = Date.now();
        const startPosition = getCoordinatesPointOrPolygon(feature)
        // Stop an ongoing movement animation
        this.stopMovementAnimation(feature as Feature<T>);
        // We don't have to animate this
        if (isEqual(startPosition, endPosition)) {
            return;
        }
        const listener = (event: RenderEvent) => {
            this.animationTick(
                event,
                startTime,
                { startPosition, endPosition },
                feature
            );
        };
        this.animationListeners.set(this.getFeatureId(feature), listener);
        // The listener unsubscribes itself
        this.layer.on('postrender', listener);
        // Trigger the first animation tick
        this.olMap.render();
    }

    private interpolate(
        startCoordinate: Coordinate,
        endCoordinate: Coordinate,
        lerpFactor: number
    ): Coordinate {
        return [
            startCoordinate[0]! +
                (endCoordinate[0]! - startCoordinate[0]!) * lerpFactor,
            startCoordinate[1]! +
                (endCoordinate[1]! - startCoordinate[1]!) * lerpFactor,
        ];
    }

    private setCoordinates(featureGeometry: T, coordinates: Coordinates<T>) {
        // The ol typings are incorrect
        featureGeometry.setCoordinates(coordinates as any);
    }

    /**
     * This method should be called after each postrender event.
     * It sets the feature to the next interpolated position.
     */
    private animationTick(
        event: RenderEvent,
        startTime: number,
        positions: CoordinatePair<T>,
        feature: Feature<T>
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
            this.stopMovementAnimation(feature as Feature<T>);
            this.setCoordinates(featureGeometry, positions.endPosition);
            this.olMap.render();
            return;
        }
        // The next position is calculated by a linear interpolation between the start and end position(s)
        const nextPosition = (
            isCoordinatePairOfPolygon(positions)
                ? positions.startPosition[0]!.map((startPos, index) =>
                      this.interpolate(
                          startPos,
                          positions.endPosition[0]![index]!,
                          progress
                      )
                  )
                : this.interpolate(
                      (positions as CoordinatePair<Point>).startPosition,
                      (positions as CoordinatePair<Point>).endPosition,
                      progress
                  )
        ) as Coordinates<T>;
        this.setCoordinates(featureGeometry, nextPosition);
        getVectorContext(event).drawGeometry(featureGeometry);
        this.olMap.render();
    }

    public stopMovementAnimation(feature: Feature<T>) {
        const listenerId = this.getFeatureId(feature);
        if (!this.animationListeners.has(listenerId)) {
            return;
        }
        this.layer.un('postrender', this.animationListeners.get(listenerId!)!);
        this.animationListeners.delete(listenerId);
    }

    private getFeatureId(feature: Feature<T>) {
        // TODO: handle features without an id
        return feature.getId()! as UUID;
    }
}
