import type { Feature, MapBrowserEvent } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import { distance } from 'ol/coordinate';
import BaseEvent from 'ol/events/Event';
import type { LineString } from 'ol/geom';
import PointerInteraction from 'ol/interaction/Pointer';
import type VectorSource from 'ol/source/Vector';

export class ResizeRectangleInteraction extends PointerInteraction {
    /**
     * The tolerance in coordinates for hitting a corner.
     */
    private readonly hitTolerance = 3;

    private nearestCorner?: Coordinate;
    private furthestCorner?: Coordinate;
    private feature?: Feature<LineString>;
    private currentScale?: { x: number; y: number };

    constructor(private readonly source: VectorSource) {
        super({
            handleDownEvent: (event) => this._handleDownEvent(event),
            handleDragEvent: (event) => this._handleDragEvent(event),
            handleUpEvent: (event) => this._handleUpEvent(event),
        });
    }

    private _handleDownEvent(event: MapBrowserEvent<any>): boolean {
        const mouseCoordinate = event.coordinate;
        const feature = this.source.getClosestFeatureToCoordinate(
            mouseCoordinate
        ) as Feature<LineString>;
        if (!feature) {
            return false;
        }
        const geometry = feature.getGeometry()!;
        const corners = geometry.getCoordinates()!;
        const distances = corners.map((corner) =>
            distance(corner, mouseCoordinate)
        );
        const minDistance = Math.min(...distances);
        if (minDistance > this.hitTolerance) {
            // Only corners are relevant for us
            return false;
        }
        const nearestCorner = corners[distances.indexOf(minDistance)];
        const maxDistance = Math.max(...distances);
        const furthestCorner = corners[distances.indexOf(maxDistance)];
        if (nearestCorner === undefined || furthestCorner === undefined) {
            return false;
        }
        this.nearestCorner = nearestCorner;
        this.furthestCorner = furthestCorner;
        this.feature = feature;
        this.currentScale = { x: 1, y: 1 };
        return true;
    }

    private _handleDragEvent(event: MapBrowserEvent<any>): boolean {
        if (!this.feature || !this.nearestCorner || !this.furthestCorner) {
            return false;
        }
        const mouseCoordinate = event.coordinate;
        const newXScale =
            (mouseCoordinate[0]! - this.furthestCorner[0]!) /
            (this.nearestCorner[0]! - this.furthestCorner[0]!);
        const newYScale =
            (this.furthestCorner[1]! - mouseCoordinate[1]!) /
            (this.furthestCorner[1]! - this.nearestCorner[1]!);
        this.feature
            .getGeometry()!
            .scale(
                newXScale / this.currentScale!.x,
                newYScale / this.currentScale!.y,
                this.furthestCorner
            );
        this.currentScale = { x: newXScale, y: newYScale };
        return true;
    }

    private _handleUpEvent(event: MapBrowserEvent<any>): boolean {
        if (
            this.feature === undefined ||
            this.furthestCorner === undefined ||
            this.currentScale === undefined
        ) {
            return true;
        }
        const coordinates = this.feature.getGeometry()!.getCoordinates()!;
        const topLeftCoordinate = coordinates.reduce<Coordinate>(
            (smallestCoordinate, coordinate) =>
                coordinate[0]! <= smallestCoordinate[0]! ||
                coordinate[1]! >= smallestCoordinate[1]!
                    ? coordinate
                    : smallestCoordinate,
            [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
        );
        this.feature.dispatchEvent(
            new ResizeEvent(
                this.currentScale,
                this.furthestCorner,
                topLeftCoordinate
            )
        );
        this.feature = undefined;
        this.nearestCorner = undefined;
        this.furthestCorner = undefined;
        this.currentScale = undefined;
        return false;
    }

    static onResize(
        feature: Feature<LineString>,
        callback: (event: ResizeEvent) => void
    ) {
        feature.addEventListener(
            resizeRectangleEventType,
            callback as (event: BaseEvent | Event) => void
        );
    }
}

// TODO: This doesn't work as a static member of ResizeEvent, because it is undefined at runtime. Why?
const resizeRectangleEventType = 'resizerectangle';
class ResizeEvent extends BaseEvent {
    constructor(
        public readonly scale: { x: number; y: number },
        /**
         * The coordinate of the corner that didn't move during the resize.
         */
        public readonly origin: Coordinate,
        /**
         * The new top left coordinate of the rectangle.
         */
        public readonly topLeftCoordinate: Coordinate
    ) {
        super(resizeRectangleEventType);
    }
}
