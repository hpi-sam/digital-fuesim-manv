import type { MapBrowserEvent } from 'ol';
import { Translate } from 'ol/interaction';

/**
 * A more performant implementation for OpenLayers Translate interaction
 */
export class TranslateInteraction extends Translate {
    protected override handleMoveEvent(
        mapBrowserEvent: MapBrowserEvent<any>
    ): void {
        // The original handleMoveEvent() is very computation expensive and
        // only sets some cursor classes on the map. We don't need this.
        // Therefore we override this handler with an empty one.
    }
}
