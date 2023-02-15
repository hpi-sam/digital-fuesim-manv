import type { MapBrowserEvent, Feature } from 'ol';
import type Point from 'ol/geom/Point';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import type { NgZone } from '@angular/core';
import type { UUID } from 'digital-fuesim-manv-shared';
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
import type { OlMapInteractionsManager } from '../utility/ol-map-interactions-manager';
import { ElementManager } from './element-manager';

/**
 * Manages the position of the element.
 * Manages the default interactions of the element.
 * Automatically redraws a feature (= reevaluates its style function) when an element property has changed.
 */
export abstract class MoveableFeatureManager<
        Element extends PositionableElement,
        FeatureType extends GeometryWithCoordinates = Point
    >
    extends ElementManager<Element, FeatureType>
    implements FeatureManager<FeatureType>
{
    public readonly togglePopup$ = new Subject<OpenPopupOptions<any>>();
    protected movementAnimator: MovementAnimator<FeatureType>;
    public layer: VectorLayer<VectorSource<FeatureType>>;
    constructor(
        protected readonly olMap: OlMap,
        private readonly proposeMovementAction: (
            newPosition: Positions<FeatureType>,
            element: Element
        ) => void,
        protected readonly geometryHelper: GeometryHelper<FeatureType, Element>,
        renderBuffer?: number
    ) {
        super();
        this.layer = super.createElementLayer<FeatureType>(renderBuffer);
        this.movementAnimator = this.createMovementAnimator();
    }

    createMovementAnimator() {
        return new MovementAnimator<FeatureType>(
            this.olMap,
            this.layer,
            this.geometryHelper.interpolateCoordinates,
            this.geometryHelper.getFeatureCoordinates
        );
    }

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
        changedProperties: ReadonlySet<keyof Element>,
        elementFeature: Feature<FeatureType>
    ): void {
        if (changedProperties.has('position')) {
            this.movementAnimator.animateFeatureMovement(
                elementFeature,
                this.geometryHelper.getElementCoordinates(newElement)
            );
        }
        // Redraw the feature to reevaluate its style function
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
        droppedFeature: Feature<any>,
        droppedOnFeature: Feature<FeatureType>,
        dropEvent?: TranslateEvent
    ): boolean {
        return false;
    }

    public abstract register(
        changePopup$: Subject<OpenPopupOptions<any> | undefined>,
        destroy$: Subject<void>,
        ngZone: NgZone,
        mapInteractionsManager: OlMapInteractionsManager
    ): void;

    protected registerFeatureElementManager(
        elementDictionary$: Observable<{ [id: UUID]: Element }>,
        changePopup$: Subject<OpenPopupOptions<any> | undefined>,
        destroy$: Subject<void>,
        ngZone: NgZone,
        mapInteractionsManager: OlMapInteractionsManager
    ) {
        this.olMap.addLayer(this.layer);
        mapInteractionsManager.addFeatureLayer(this.layer);
        this.togglePopup$?.subscribe(changePopup$);
        this.registerChangeHandlers(
            elementDictionary$,
            destroy$,
            ngZone,
            (element) => this.onElementCreated(element),
            (element) => this.onElementDeleted(element),
            (oldElement, newElement) =>
                this.onElementChanged(oldElement, newElement)
        );
    }
}
