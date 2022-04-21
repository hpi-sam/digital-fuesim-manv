import type { Feature, MapBrowserEvent } from 'ol';
import type Point from 'ol/geom/Point';
import type { Type } from '@angular/core';
import { Subject } from 'rxjs';
import type { Constructor } from 'digital-fuesim-manv-shared';
import type { LineString } from 'ol/geom';
import { isArray } from 'lodash-es';
import type { Coordinate } from 'ol/coordinate';
import type {
    ElementFeatureManager,
    PositionableElement,
} from '../feature-managers/element-feature-manager';
import type { OpenPopupOptions, PopupComponent } from './popup-manager';
import { calculatePopupPositioning } from './calculate-popup-positioning';

/**
 * A mixin that adds the ability to open a popup to an element feature manager.
 */
export function withPopup<
    // It is necessary to specify this type explicitly,
    // because otherwise there are type errors if the Element is a superset
    // of { id: UUID, position: Position, image: ImageProperties }
    Element extends PositionableElement,
    BaseType extends Constructor<ElementFeatureManager<Element, FeatureType>>,
    PopupComponentType extends PopupComponent,
    FeatureType extends LineString | Point = Point
>(
    baseClass: BaseType,
    popoverOptions: {
        component: Type<PopupComponentType>;
        height: number;
        width: number;
        getContext: (
            feature: Feature<FeatureType>
        ) => Partial<InstanceType<Type<PopupComponentType>>>;
    }
) {
    return class WithPopup extends baseClass {
        /**
         * When this subject emits, a popup with the specified options should be toggled.
         */
        public readonly togglePopup$ = new Subject<OpenPopupOptions<any>>();

        public override onFeatureClicked(
            event: MapBrowserEvent<any>,
            feature: Feature<FeatureType>
        ): void {
            super.onFeatureClicked(event, feature);
            const featureCenter = feature.getGeometry()!.getCoordinates();
            const view = this.olMap.getView();
            const zoom = view.getZoom()!;
            const { position, positioning } = calculatePopupPositioning(
                isArray(featureCenter[0])
                    ? // TODO: Use center instead of first coordinate
                      (featureCenter as Coordinate[])[0]
                    : (featureCenter as Coordinate),
                {
                    // TODO: reuse the image constraints
                    width: popoverOptions.width / zoom,
                    height: popoverOptions.height / zoom,
                },
                view.getCenter()!
            );
            this.togglePopup$.next({
                position,
                positioning,
                component: popoverOptions.component as any,
                context: popoverOptions.getContext(feature),
            });
        }
    };
}
