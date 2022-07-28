import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type OlMap from 'ol/Map';
import type RenderEvent from 'ol/render/Event';
import type { Feature } from 'ol';
import { getVectorContext } from 'ol/render';
import type Point from 'ol/geom/Point';
import type { UUID } from 'digital-fuesim-manv-shared';
import { isArray, isEqual } from 'lodash-es';
import type { LineString } from 'ol/geom';
import type { Coordinate } from 'ol/coordinate';

export type Coordinates<T extends LineString | Point> = T extends Point
    ? Coordinate
    : Coordinate[];

interface CoordinatePair<T extends Coordinate | Coordinate[]> {
    startPosition: T;
    endPosition: T;
}

/**
 * Animates the movement of a feature to a new position.
 */
export class MovementAnimator<T extends LineString | Point> {
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
        const startTime = Date.now();
        const featureGeometry = feature.getGeometry()!;
        const startPosition =
            featureGeometry.getCoordinates() as Coordinates<T>;
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

    private isCoordinateArrayPair(
        coordinates: CoordinatePair<Coordinates<LineString | Point>>
    ): coordinates is CoordinatePair<Coordinates<LineString>> {
        return isArray(coordinates.startPosition[0]);
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
        positions: CoordinatePair<Coordinates<T>>,
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
        // If we have coordinate arrays, there must be at least as many endCoordinates as startCoordinates
        if (
            this.isCoordinateArrayPair(positions) &&
            positions.startPosition.length > positions.endPosition.length
        ) {
            throw new Error(
                `Got unexpected too few endPositions: ${JSON.stringify(
                    positions
                )}`
            );
        }
        // The next position is calculated by a linear interpolation between the start and end position(s)
        const nextPosition = (
            this.isCoordinateArrayPair(positions)
                ? positions.startPosition.map((startPos, index) =>
                      this.interpolate(
                          startPos,
                          positions.endPosition[index]!,
                          progress
                      )
                  )
                : this.interpolate(
                      positions.startPosition as Coordinates<Point>,
                      positions.endPosition as Coordinates<Point>,
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
