import type { UUID, Position, Size } from 'digital-fuesim-manv-shared';
import type { MapBrowserEvent } from 'ol';
import { Feature } from 'ol';
import GeometryType from 'ol/geom/GeometryType';
import Point from 'ol/geom/Point';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type OlMap from 'ol/Map';
import type { AppState } from 'src/app/state/app.state';
import type { Store } from '@ngrx/store';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { TranslateEvent } from 'ol/interaction/Translate';
import { LineString } from 'ol/geom';
import { isArray } from 'lodash-es';
import type { Coordinate } from 'ol/coordinate';
import type { Coordinates } from '../utility/movement-animator';
import { MovementAnimator } from '../utility/movement-animator';
import { TranslateHelper } from '../utility/translate-helper';
import type { FeatureManager } from '../utility/feature-manager';
import type { WithPosition } from '../../utility/types/with-position';
import { ElementManager } from './element-manager';

export interface PositionableElement {
    readonly id: UUID;
    readonly position: Position;
}

function isLineString(
    feature: Feature<LineString | Point>
): feature is Feature<LineString> {
    return feature.getGeometry()!.getType() === GeometryType.LINE_STRING;
}

export function isCoordinateArray(
    coordinates: Coordinate | Coordinate[]
): coordinates is Coordinate[] {
    return isArray(coordinates[0]);
}

export const pointCreator = (element: WithPosition<any>): Feature<Point> =>
    new Feature(new Point([element.position.x, element.position.y]));

export const lineStringCreator = (element: {
    position: Position;
    size: Size;
}): Feature<LineString> =>
    new Feature(
        new LineString([
            [element.position.x, element.position.y],
            [element.position.x + element.size.width, element.position.y],
            [
                element.position.x + element.size.width,
                element.position.y - element.size.height,
            ],
            [element.position.x, element.position.y - element.size.height],
            [element.position.x, element.position.y],
        ])
    );

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
    private readonly movementAnimator;
    protected readonly translateHelper = new TranslateHelper<FeatureType>();
    // private readonly elementCreator: (element: Element) => ElementFeature;

    constructor(
        protected readonly store: Store<AppState>,
        protected readonly olMap: OlMap,
        public readonly layer: VectorLayer<VectorSource<FeatureType>>,
        private readonly proposeMovementAction: (
            newPosition: FeatureType extends Point ? Position : Position[],
            element: Element
        ) => void,
        private readonly createElement: (element: Element) => ElementFeature
    ) {
        super();
        this.movementAnimator = new MovementAnimator<FeatureType>(
            this.olMap,
            this.layer
        );
    }

    override unsupportedChangeProperties: ReadonlySet<keyof Element> = new Set(
        [] as const
    );
    createFeature(element: Element): ElementFeature {
        const elementFeature = this.createElement(element);
        elementFeature.setId(element.id);
        this.layer.getSource()!.addFeature(elementFeature);
        this.translateHelper.onTranslateEnd(elementFeature, (newPosition) => {
            this.proposeMovementAction(newPosition, element);
        });
        return elementFeature;
    }

    deleteFeature(element: Element, elementFeature: ElementFeature): void {
        this.layer.getSource()!.removeFeature(elementFeature);
        this.movementAnimator.stopMovementAnimation(elementFeature);
    }

    changeFeature(
        oldElement: Element,
        newElement: Element,
        // It is too much work to correctly type this param with {@link unsupportedChangeProperties}
        changedProperties: ReadonlySet<keyof Element>,
        elementFeature: ElementFeature,
        triggerCondition: (
            changedProperties: ReadonlySet<keyof Element>
        ) => boolean = (updatedProperties) => updatedProperties.has('position'),
        targetPosition: (newElement: Element) => Coordinates<FeatureType> = (
            updatedElement: Element
        ) => {
            const newFeature = this.getFeatureFromElement(updatedElement);
            if (!newFeature) {
                throw new TypeError('newFeature undefined');
            }
            return (
                isLineString(newFeature)
                    ? (newFeature.getGeometry()! as LineString).getCoordinates()
                    : [updatedElement.position.x, updatedElement.position.y]
            ) as Coordinates<FeatureType>;
        }
    ): void {
        if (triggerCondition(changedProperties)) {
            this.movementAnimator.animateFeatureMovement(
                elementFeature,
                targetPosition(newElement)
            );
        }
    }

    getFeatureFromElement(element: Element): ElementFeature | undefined {
        return (
            (this.layer
                .getSource()!
                .getFeatureById(element.id) as ElementFeature | null) ??
            undefined
        );
    }

    protected getElementFromFeature(feature: Feature<any>) {
        const id = feature.getId() as UUID;
        const exerciseState = getStateSnapshot(this.store).exercise;
        // We expect the id to be globally unique
        if (exerciseState.materials[id]) {
            return {
                type: 'material',
                value: exerciseState.materials[id] as unknown as Element,
            } as const;
        }
        if (exerciseState.patients[id]) {
            return {
                type: 'patient',
                value: exerciseState.patients[id] as unknown as Element,
            } as const;
        }
        if (exerciseState.vehicles[id]) {
            return {
                type: 'vehicle',
                value: exerciseState.vehicles[id] as unknown as Element,
            } as const;
        }
        if (exerciseState.personnel[id]) {
            return {
                type: 'personnel',
                value: exerciseState.personnel[id] as unknown as Element,
            } as const;
        }
        if (exerciseState.mapImages[id]) {
            return {
                type: 'image',
                value: exerciseState.mapImages[id] as unknown as Element,
            } as const;
        }
        if (exerciseState.viewports[id]) {
            return {
                type: 'viewport',
                value: exerciseState.viewports[id] as unknown as Element,
            } as const;
        }
        if (exerciseState.transferPoints[id]) {
            return {
                type: 'transferPoint',
                value: exerciseState.transferPoints[id] as unknown as Element,
            } as const;
        }
        return undefined;
    }

    public getCenter(feature: ElementFeature): Coordinate {
        const coordinates = feature.getGeometry()!.getCoordinates();
        return isCoordinateArray(coordinates)
            ? [
                  coordinates[0][0] +
                      (coordinates[2][0] - coordinates[0][0]) / 2,
                  coordinates[0][1] +
                      (coordinates[2][1] - coordinates[0][1]) / 2,
              ]
            : coordinates;
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
