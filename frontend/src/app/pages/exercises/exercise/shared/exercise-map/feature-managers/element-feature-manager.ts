import type {
    ExerciseState,
    Position,
} from 'digital-fuesim-manv-shared';
import type { MapBrowserEvent, Feature } from 'ol';
import type { Geometry, Polygon } from 'ol/geom';
import type Point from 'ol/geom/Point';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import { Subject } from 'rxjs';
import type { FeatureManager } from '../utility/feature-manager';
import { MovementAnimator } from '../utility/movement-animator';
import {
    Coordinates,
    GeometryWithCoorindates,
    getCoordinatesPoint,
    getCoordinatesPointOrPolygon,
    getCoordinatesPolygon,
    isPointFeature,
    PositionableElement} from '../utility/ol-geometry-helpers';
import {
    isPolygonFeature,
} from '../utility/ol-geometry-helpers';
import type { OpenPopupOptions } from '../utility/popup-manager';
import { TranslateInteraction } from '../utility/translate-interaction';
import { ElementManager } from './element-manager';

/**
 * The base class for all element feature managers.
 * * manages the position of the element
 * * manages the default interactions of the element
 */
export abstract class ElementFeatureManager<
        Element extends PositionableElement,
        FeatureType extends GeometryWithCoorindates = Point,
        ElementFeature extends Feature<FeatureType> = Feature<FeatureType>
    >
    extends ElementManager<
        Element,
        FeatureType,
        ElementFeature,
        ReadonlySet<keyof Element>
    >
    implements FeatureManager<ElementFeature>
{
    abstract override readonly type: keyof ExerciseState;
    public readonly togglePopup$ = new Subject<OpenPopupOptions<any>>();
    protected readonly movementAnimator = new MovementAnimator<FeatureType>(
        this.olMap,
        this.layer
    );
    constructor(
        protected readonly olMap: OlMap,
        public readonly layer: VectorLayer<VectorSource<FeatureType>>,
        private readonly proposeMovementAction: (
            newPosition: FeatureType extends Point ? Position : Position[],
            element: Element
        ) => void,
        private readonly createElement: (element: Element) => ElementFeature
    ) {
        super();
    }

    override unsupportedChangeProperties: ReadonlySet<keyof Element> = new Set(
        [] as const
    );
    createFeature(element: Element): ElementFeature {
        const elementFeature = this.createElement(element);
        elementFeature.setId(element.id);
        this.layer.getSource()!.addFeature(elementFeature);
        TranslateInteraction.onTranslateEnd<FeatureType>(
            elementFeature,
            (newPosition) => {
                this.proposeMovementAction(newPosition, element);
            }
        );
        return elementFeature;
    }

    isFeatureTranslatable(feature: ElementFeature) {
        return true;
    }

    deleteFeature(element: Element, elementFeature: ElementFeature): void {
        this.layer.getSource()!.removeFeature(elementFeature);
        elementFeature.dispose();
        this.movementAnimator.stopMovementAnimation(elementFeature);
    }

    changeFeature(
        oldElement: Element,
        newElement: Element,
        // It is too much work to correctly type this param with {@link unsupportedChangeProperties}
        changedProperties: ReadonlySet<keyof Element>,
        elementFeature: ElementFeature
    ): void {
        if (changedProperties.has('position')) {
            const newFeature = this.getFeatureFromElement(newElement);
            if (!newFeature) {
                throw new TypeError('newFeature undefined');
            }
            if (!isPointFeature(newFeature) && !isPolygonFeature(newFeature)) {
                throw new TypeError('newFeature is not animatable')
            }

            this.movementAnimator.animateFeatureMovement(
                elementFeature,
                getCoordinatesPointOrPolygon(newFeature),
            );
        }
        // If the style has updated, we need to redraw the feature
        elementFeature.changed();
    }

    getFeatureFromElement(element: Element): ElementFeature | undefined {
        return (
            (this.layer
                .getSource()!
                .getFeatureById(element.id) as ElementFeature | null) ??
            undefined
        );
    }

    public onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: ElementFeature
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    ): void {}

    /**
     * The standard implementation is to ignore these events.
     */
    public onFeatureDrop(
        dropEvent: TranslateEvent,
        droppedFeature: Feature<any>,
        droppedOnFeature: ElementFeature
    ): boolean {
        return false;
    }
}
