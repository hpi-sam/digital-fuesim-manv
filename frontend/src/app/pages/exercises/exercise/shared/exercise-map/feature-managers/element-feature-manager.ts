import type {
    ExerciseState,
    Position,
    Size,
    UUID,
} from 'digital-fuesim-manv-shared';
import { isArray } from 'lodash-es';
import type { MapBrowserEvent } from 'ol';
import { Feature } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import { LineString } from 'ol/geom';
import Point from 'ol/geom/Point';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import { Subject } from 'rxjs';
import type { WithPosition } from '../../utility/types/with-position';
import type { FeatureManager } from '../utility/feature-manager';
import type { Coordinates } from '../utility/movement-animator';
import { MovementAnimator } from '../utility/movement-animator';
import type { OpenPopupOptions } from '../utility/popup-manager';
import { TranslateInteraction } from '../utility/translate-interaction';
import { ElementManager } from './element-manager';

export interface PositionableElement {
    readonly id: UUID;
    readonly position: Position;
}

export interface ResizableElement extends PositionableElement {
    size: Size;
}

function isLineString(
    feature: Feature<LineString | Point>
): feature is Feature<LineString> {
    return feature.getGeometry()!.getType() === 'LineString';
}

export function isCoordinateArray(
    coordinates: Coordinate | Coordinate[]
): coordinates is Coordinate[] {
    return isArray(coordinates[0]);
}

export const createPoint = (element: WithPosition<any>): Feature<Point> =>
    new Feature(new Point([element.position.x, element.position.y]));

export const createLineString = (
    element: ResizableElement
): Feature<LineString> =>
    new Feature(new LineString(getCoordinateArray(element)));

export function getCoordinateArray(element: ResizableElement) {
    return [
        [element.position.x, element.position.y],
        [element.position.x + element.size.width, element.position.y],
        [
            element.position.x + element.size.width,
            element.position.y - element.size.height,
        ],
        [element.position.x, element.position.y - element.size.height],
        [element.position.x, element.position.y],
    ];
}

/**
 * The base class for all element feature managers.
 * * manages the position of the element
 * * manages the default interactions of the element
 */
export abstract class ElementFeatureManager<
        Element extends PositionableElement,
        FeatureType extends LineString | Point = Point,
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
            this.movementAnimator.animateFeatureMovement(
                elementFeature,
                (isLineString(newFeature)
                    ? (newFeature.getGeometry()! as LineString).getCoordinates()
                    : [
                          newElement.position.x,
                          newElement.position.y,
                      ]) as Coordinates<FeatureType>
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

    public getCenter(feature: ElementFeature): Coordinate {
        const coordinates = feature.getGeometry()!.getCoordinates();
        if (!isCoordinateArray(coordinates)) {
            return coordinates;
        }
        // We need index 0 and 2 for the center
        if (coordinates.length < 3) {
            throw new Error(`Unexpectedly short array: ${coordinates}`);
        }
        return [
            coordinates[0]![0]! +
                (coordinates[2]![0]! - coordinates[0]![0]!) / 2,
            coordinates[0]![1]! +
                (coordinates[2]![1]! - coordinates[0]![1]!) / 2,
        ];
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
