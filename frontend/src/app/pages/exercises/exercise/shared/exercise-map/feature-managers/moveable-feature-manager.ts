import type { ExerciseState } from 'digital-fuesim-manv-shared';
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
    CoordinatePair,
    Coordinates,
    GeometryWithCoorindates,
    PositionableElement,
    Positions,
} from '../utility/ol-geometry-helpers';
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
    protected readonly movementAnimator: MovementAnimator<FeatureType>;
    constructor(
        protected readonly olMap: OlMap,
        public readonly layer: VectorLayer<VectorSource<FeatureType>>,
        private readonly proposeMovementAction: (
            newPosition: Positions<FeatureType>,
            element: Element
        ) => void,
        private readonly createElement: (element: Element) => ElementFeature,
        private readonly getNextPosition: (
            positions: CoordinatePair<FeatureType>,
            progress: number
        ) => Coordinates<FeatureType>,
        private readonly getCoordinates: (
            feature: Feature<FeatureType>
        ) => Coordinates<FeatureType>,
        private readonly getPosition: (
            feature: Feature<FeatureType>
        ) => Positions<FeatureType>
    ) {
        super();
        this.movementAnimator = new MovementAnimator<FeatureType>(
            this.olMap,
            this.layer,
            this.getNextPosition,
            this.getCoordinates
        );
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
            },
            this.getPosition
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

            this.movementAnimator.animateFeatureMovement(
                elementFeature,
                this.getCoordinates(newFeature)
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
