import { Position } from 'digital-fuesim-manv-shared';
import { isEqual } from 'lodash-es';
import type { Feature, MapBrowserEvent } from 'ol';
import type { LineString, Point } from 'ol/geom';
import { Translate } from 'ol/interaction';
import { isCoordinateArray } from '../feature-managers/element-feature-manager';

/**
 * Translates (moves) a feature to a new position.
 *
 * It is different to the standard {@link Translate} interaction in the following ways:
 * * Clicking on an element doesn't trigger a `translateend` event - a `singleclick` interaction should be used instead
 * Be aware that this means that not every `translatestart` event will have an accompanying `translateend` event.
 * * More performant (see {@link handleMoveEvent})
 * * There are additional helper methods that can be used on features in layers that have this interaction:
 *     * onTranslateEnd
 */
export class TranslateInteraction extends Translate {
    constructor(...args: ConstructorParameters<typeof Translate>) {
        super(...args);
        // Clicking on an element shouldn't trigger a `translateend` event
        // This must be the first event listener to stop the event-propagation to following event listeners
        this.on('translateend', (event) => {
            if (isEqual(event.coordinate, event.startCoordinate)) {
                event.stopPropagation();
            }
        });
        // These event don't propagate to anything else by default.
        // We therefore have to propagate them manually to the specific features.
        const translateEvents = [
            'translatestart',
            'translating',
            'translateend',
        ] as const;
        for (const eventName of translateEvents) {
            this.on(eventName, (event) => {
                event.features.forEach((feature: Feature) => {
                    feature.dispatchEvent(event);
                });
            });
        }
    }

    /**
     * Calls {@link callback} with the new coordinates of the feature
     * every time the {@link feature} has been translated
     *
     * You can only call this function if the layer of the feature has this Interaction.
     */
    public static onTranslateEnd<T extends LineString | Point = Point>(
        feature: Feature<T>,
        callback: (
            newCoordinates: T extends Point ? Position : Position[]
        ) => void
    ) {
        feature.addEventListener('translateend', (event) => {
            // The end coordinates in the event are the mouse coordinates and not the feature coordinates.
            const coordinates = feature.getGeometry()!.getCoordinates();
            if (isCoordinateArray(coordinates)) {
                callback(
                    coordinates.map((coordinate) =>
                        Position.create(coordinate[0]!, coordinate[1]!)
                    ) as T extends Point ? never : Position[]
                );
                return;
            }
            callback(
                Position.create(
                    coordinates[0]!,
                    coordinates[1]!
                ) as T extends Point ? Position : never
            );
        });
    }

    protected override handleMoveEvent(
        mapBrowserEvent: MapBrowserEvent<any>
    ): void {
        // The original handleMoveEvent() is very computation expensive and
        // only sets some cursor classes on the map. We don't need this.
        // Therefore we override this handler with an empty one.
    }
}
