import type { MapBrowserEvent, Feature } from 'ol';
import type Point from 'ol/geom/Point';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import { Subject } from 'rxjs';
import type { FeatureManager } from '../utility/feature-manager';
import { MovementAnimator } from '../utility/movement-animator';
import type {
    GeometryHelper,
    GeometryWithCoordinates,
    PositionableElement,
    Positions,
} from '../utility/geometry-helper';
import type { OpenPopupOptions } from '../utility/popup-manager';
import { TranslateInteraction } from '../utility/translate-interaction';
import { ElementManager } from './element-manager';

/**
 * The base class for all element feature managers.
 * * manages the position of the element
 * * manages the default interactions of the element
 */
export abstract class MoveableFeatureManager<
        Element extends PositionableElement,
        FeatureType extends GeometryWithCoordinates = Point
    >
    extends ElementManager<Element, FeatureType, ReadonlySet<keyof Element>>
    implements FeatureManager<FeatureType>
{
    public readonly togglePopup$ = new Subject<OpenPopupOptions<any>>();
    protected readonly movementAnimator: MovementAnimator<FeatureType>;
    constructor(
        protected readonly olMap: OlMap,
        public readonly layer: VectorLayer<VectorSource<FeatureType>>,
        private readonly proposeMovementAction: (
            newPosition: Positions<FeatureType>,
            element: Element
        ) => void,
        protected readonly geometryHelper: GeometryHelper<FeatureType, Element>
    ) {
        super();
        this.movementAnimator = new MovementAnimator<FeatureType>(
            this.olMap,
            this.layer,
            this.geometryHelper.interpolateCoordinates,
            this.geometryHelper.getFeatureCoordinates
        );
    }

    override unsupportedChangeProperties: ReadonlySet<keyof Element> = new Set(
        [] as const
    );
    createFeature(element: Element): Feature<FeatureType> {
        const elementFeature = this.geometryHelper.create(element);
        elementFeature.setId(element.id);
        this.layer.getSource()!.addFeature(elementFeature);
        TranslateInteraction.onTranslateEnd<FeatureType>(
            elementFeature,
            (newPosition) => {
                this.proposeMovementAction(newPosition, element);
            },
            this.geometryHelper.getFeaturePosition
        );
        return elementFeature;
    }

    isFeatureTranslatable(feature: Feature<FeatureType>) {
        return true;
    }

    deleteFeature(
        element: Element,
        elementFeature: Feature<FeatureType>
    ): void {
        this.layer.getSource()!.removeFeature(elementFeature);
        elementFeature.dispose();
        this.movementAnimator.stopMovementAnimation(elementFeature);
    }

    changeFeature(
        oldElement: Element,
        newElement: Element,
        // It is too much work to correctly type this param with {@link unsupportedChangeProperties}
        changedProperties: ReadonlySet<keyof Element>,
        elementFeature: Feature<FeatureType>
    ): void {
        if (changedProperties.has('position')) {
            this.movementAnimator.animateFeatureMovement(
                elementFeature,
                this.geometryHelper.getElementCoordinates(newElement)
            );
        }
        // If the style has updated, we need to redraw the feature
        elementFeature.changed();
    }

    getFeatureFromElement(element: Element): Feature<FeatureType> | undefined {
        return (
            (this.layer
                .getSource()!
                .getFeatureById(element.id) as Feature<FeatureType> | null) ??
            undefined
        );
    }

    public onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<FeatureType>
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    ): void {}

    /**
     * The standard implementation is to ignore these events.
     */
    public onFeatureDrop(
        dropEvent: TranslateEvent,
        droppedFeature: Feature<any>,
        droppedOnFeature: Feature<FeatureType>
    ): boolean {
        return false;
    }
}
