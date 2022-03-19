import type { ImmutableJsonObject } from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import { generateChangedProperties } from '../utility/generate-changed-properties';

/**
 * Provides an Api to update a feature based on changes to an element (patient, vehicle, etc.).
 *
 * {@link Element} is the immutable JSON object (Patient, Vehicle, etc.)
 * {@link ElementFeature} is the OpenLayers Feature that should be rendered to represent the {@link Element}.
 */
export abstract class FeatureManager<
    Element extends ImmutableJsonObject,
    ElementFeature extends Feature<any>,
    SupportedChangeProperties extends ReadonlySet<keyof Element>
> {
    /**
     * This should be called if a new element is added.
     */
    public onElementCreated(element: Element) {
        this.createFeature(element);
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
     * The best way to reflect the changes on the feature is mostly to update the already created feature directly.
     * But, because this requires extra code for each changed property, it is not feasible to do for all properties.
     * The properties that are supported to be updated this way are saved in {@link supportedChangeProperties} and the changes are handled in {@link changeFeature}.
     * If any other property has changed, we deleted the old feature and create a new one instead.
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
        this.changeFeature(
            oldElement,
            newElement,
            changedProperties,
            elementFeature
        );
    }

    /**
     * Adds a new feature representing the {@link element} to the map.
     */
    abstract createFeature(element: Element): void;

    /**
     * Delete the {@link elementFeature} representing the {@link element} from the map.
     */
    abstract deleteFeature(
        element: Element,
        elementFeature: ElementFeature
    ): void;

    /**
     * The properties of {@link Element} for which custom changes can be handled in {@link changeFeature}.
     */
    abstract readonly supportedChangeProperties: SupportedChangeProperties;
    /**
     * This method must only be called if solely properties in {@link supportedChangeProperties} are different between the two elements
     * @param changedProperties The properties that have changed between the {@link oldElement } and the {@link newElement }
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

    private areAllPropertiesSupported(
        changedProperties: ReadonlySet<keyof Element>
    ): changedProperties is SupportedChangeProperties {
        for (const changedProperty of changedProperties) {
            if (!this.supportedChangeProperties.has(changedProperty)) {
                return false;
            }
        }
        return true;
    }
}
