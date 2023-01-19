import type { ImmutableJsonObject } from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import type { Geometry, Point, Polygon } from 'ol/geom';
import { generateChangedProperties } from '../utility/generate-changed-properties';

/**
 * Provides an Api to update a feature based on changes to an element (patient, vehicle, etc.).
 *
 * {@link Element} is the immutable JSON object (Patient, Vehicle, etc.)
 * {@link ElementFeature} is the OpenLayers Feature that should be rendered to represent the {@link Element}.
 */
export abstract class ElementManager<
    Element extends ImmutableJsonObject,
    FeatureType extends Geometry,
    ElementFeature extends Feature<FeatureType>,
    UnsupportedChangeProperties extends ReadonlySet<keyof Element>,
    SupportedChangeProperties extends Exclude<
        ReadonlySet<keyof Element>,
        UnsupportedChangeProperties
    > = Exclude<ReadonlySet<keyof Element>, UnsupportedChangeProperties>
> {
    /**
     * When an element gets (dragged &) dropped, this identifies the type of the dropped element.
     * @example `patients`
     */
    abstract readonly type: string;

    /**
     * This should be called if a new element is added.
     */
    public onElementCreated(element: Element) {
        const feature = this.createFeature(element);
        feature.set(featureKeys.type, this.type);
        feature.set(featureKeys.value, element);
    }

    /**
     * This should be called if an element is deleted.
     * It is not necessary to make sure wether the element has been created before or not.
     */
    public onElementDeleted(element: Element): void {
        const elementFeature = this.getFeatureFromElement(element);
        if (!elementFeature) {
            return;
        }
        this.deleteFeature(element, elementFeature);
    }

    /**
     * This should be called if an element is changed.
     *
     * The best way to reflect the changes on the feature is mostly to update the already created feature directly. This is done in {@link changeFeature}.
     * But, because this requires extra code for each changed property, it is not feasible to do for all properties.
     * If any property in {@link unsupportedChangeProperties} has changed, we deleted the old feature and create a new one instead.
     */
    public onElementChanged(oldElement: Element, newElement: Element): void {
        const elementFeature = this.getFeatureFromElement(oldElement);
        if (!elementFeature) {
            // If the element is not yet rendered on the map - we have to create it first
            this.onElementCreated(newElement);
            return;
        }
        const changedProperties = generateChangedProperties(
            oldElement,
            newElement
        );
        if (!this.areAllPropertiesSupported(changedProperties)) {
            this.onElementDeleted(oldElement);
            this.onElementCreated(newElement);
            return;
        }
        elementFeature.set(featureKeys.value, newElement);
        this.changeFeature(
            oldElement,
            newElement,
            changedProperties,
            elementFeature
        );
    }

    public recreateFeature(element: Element) {
        this.onElementDeleted(element);
        this.onElementCreated(element);
    }

    /**
     * Adds a new feature representing the {@link element} to the map.
     */
    abstract createFeature(element: Element): ElementFeature;

    /**
     * Delete the {@link elementFeature} representing the {@link element} from the map.
     */
    abstract deleteFeature(
        element: Element,
        elementFeature: ElementFeature
    ): void;

    /**
     * The properties of {@link Element} for which custom changes cannot be handled in {@link changeFeature}.
     */
    abstract readonly unsupportedChangeProperties: UnsupportedChangeProperties;
    /**
     * This method must only be called if no properties in {@link unsupportedChangeProperties} are different between the two elements
     * @param changedProperties The properties that have changed between the {@link oldElement} and the {@link newElement}
     * @param elementFeature The openLayers feature that should be updated to reflect the changes
     */
    abstract changeFeature(
        oldElement: Element,
        newElement: Element,
        changedProperties: SupportedChangeProperties,
        elementFeature: ElementFeature
    ): void;

    abstract getFeatureFromElement(
        element: Element
    ): ElementFeature | undefined;

    public getElementFromFeature(feature: Feature<any>) {
        return {
            type: feature.get(featureKeys.type),
            value: feature.get(featureKeys.value),
        };
    }

    private areAllPropertiesSupported(
        changedProperties: ReadonlySet<keyof Element>
    ): changedProperties is SupportedChangeProperties {
        for (const changedProperty of changedProperties) {
            if (this.unsupportedChangeProperties.has(changedProperty)) {
                return false;
            }
        }
        return true;
    }
}

/**
 * The keys of the feature, where the type and most recent value of the respective element are saved to
 */
const featureKeys = {
    value: 'elementValue',
    // TODO: In the future the type should be saved in the element itself
    type: 'elementType',
};
