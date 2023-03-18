import type { Feature, MapBrowserEvent } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import { distance } from 'ol/coordinate';
import BaseEvent from 'ol/events/Event';
import { getCenter } from 'ol/extent';
import type { Polygon } from 'ol/geom';
import PointerInteraction from 'ol/interaction/Pointer';
import type VectorSource from 'ol/source/Vector';

/**
 * Provides the ability to resize a rectangle by dragging any of its corners.
 * It prevents the rectangle from flipping and from getting too small.
 */
export class ResizeRectangleInteraction extends PointerInteraction {
    /**
     * The tolerance in coordinates for hitting a corner.
     */
    private readonly hitTolerance = 3;

    /**
     * Temporary values for the current resize operation.
     * If undefined no resize operation is currently in progress.
     */
    private currentResizeValues?: CurrentResizeValues;

    constructor(
        private readonly source: VectorSource<Polygon>,
        /**
         * The minimum allowed distance between two corners of the rectangle.
         */
        // TODO: Add a proper unit for this. Blocked by #374
        private readonly minimumSize = 10
    ) {
        super({
            handleDownEvent: (event) => this._handleDownEvent(event),
            handleDragEvent: (event) => this._handleDragEvent(event),
            handleUpEvent: (event) => this._handleUpEvent(event),
        });
    }

    private _handleDownEvent(event: MapBrowserEvent<any>): boolean {
        const mouseCoordinate = event.coordinate;
        const feature =
            this.source.getClosestFeatureToCoordinate(mouseCoordinate);
        if (!feature) {
            return false;
        }
        const geometry = feature.getGeometry()!;
        const corners = geometry.getCoordinates()![0]!;
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
        this.currentResizeValues = {
            draggedCorner: nearestCorner,
            originCorner: furthestCorner,
            feature,
            currentScale: { x: 1, y: 1 },
        };
        return true;
    }

    private _handleDragEvent(event: MapBrowserEvent<any>): boolean {
        if (this.currentResizeValues === undefined) {
            return false;
        }
        const mouseCoordinate = event.coordinate;
        const { draggedCorner, originCorner, currentScale, feature } =
            this.currentResizeValues;
        const newXScale = this.calculateNewScale(
            draggedCorner[0]!,
            originCorner[0]!,
            mouseCoordinate[0]!
        );
        const newYScale = this.calculateNewScale(
            draggedCorner[1]!,
            originCorner[1]!,
            mouseCoordinate[1]!
        );
        feature
            .getGeometry()!
            .scale(
                newXScale / currentScale.x,
                newYScale / currentScale.y,
                originCorner
            );
        this.currentResizeValues.currentScale = { x: newXScale, y: newYScale };
        return true;
    }

    private calculateNewScale(
        draggedCorner: number,
        originCorner: number,
        mouseCoordinate: number
    ) {
        const oldLength = draggedCorner - originCorner;
        const newLength = mouseCoordinate - originCorner;
        return (
            // We also want to prevent flipping the rectangle
            (oldLength < 0
                ? Math.min(newLength, -this.minimumSize)
                : Math.max(newLength, this.minimumSize)) / oldLength
        );
    }

    private _handleUpEvent(event: MapBrowserEvent<any>): boolean {
        if (this.currentResizeValues === undefined) {
            return true;
        }
        const { currentScale, feature } = this.currentResizeValues;
        const newCenterCoordinate = getCenter(
            feature.getGeometry()!.getExtent()
        );
        feature.dispatchEvent(
            new ResizeEvent(currentScale, newCenterCoordinate)
        );
        this.currentResizeValues = undefined;
        return false;
    }

    static onResize(
        feature: Feature<Polygon>,
        callback: (event: ResizeEvent) => void
    ) {
        feature.addEventListener(
            resizeRectangleEventType,
            callback as (event: BaseEvent | Event) => void
        );
    }
}

interface CurrentResizeValues {
    draggedCorner: Coordinate;
    /**
     * The corner that doesn't move during the resize.
     * It is always opposite to the dragged corner.
     */
    originCorner: Coordinate;
    /**
     * The feature that is currently being resized.
     */
    feature: Feature<Polygon>;
    currentScale: { x: number; y: number };
}

// TODO: This doesn't work as a static member of ResizeEvent, because it is undefined at runtime. Why?
const resizeRectangleEventType = 'resizerectangle';

class ResizeEvent extends BaseEvent {
    constructor(
        public readonly scale: { x: number; y: number },
        public readonly centerCoordinate: Coordinate
    ) {
        super(resizeRectangleEventType);
    }
}
