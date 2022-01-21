import type { Feature } from 'ol';
import { generateChangedProperties } from '../utility/generate-changed-properties';

/**
 * Provides an Api to update the rendered the changes to an element (patient, vehicle, etc.)
 *
 * {@link Element} is the immutable JSON object (Patient, Vehicle, etc.)
 * {@link ElementFeature} is the OpenLayers Feature that should be rendered to represent the {@link Element}.
 *
 * Often not all elements need to be rendered to the map.
 * For example, the feature should only be created if the element is has a position (could be optional).
 * {@link CreatableElement} is the immutable JSON object that satisfies this requirement.
 */
export abstract class FeatureManager<
    Element extends object,
    ElementFeature extends Feature<any>,
    CreatableElement extends Element,
    SupportedChangeProperties extends ReadonlySet<keyof CreatableElement>
> {
    /**
     * @returns wether a feature for {@link element} should be created. It also acts as a type guard.
     */
    abstract canBeCreated(element: Element): element is CreatableElement;

    /**
     * This should be called if a new element is added.
     */
    public onElementCreated(element: Element) {
        if (!this.canBeCreated(element)) {
            return;
        }
        this.createFeature(element);
    }

    /**
     * Adds a new feature representing the {@link element } to the map.
     */
    abstract createFeature(element: CreatableElement): void;

    /**
     * Delete the rendered element (if it exists)
     */
    public onElementDeleted(element: Element): void {
        const elementFeature = this.getElementFeature(element);
        if (!elementFeature) {
            return;
        }
        this.deleteFeature(element, elementFeature);
    }

    /**
     * Delete the {@link elementFeature} representing the {@link element} from the map.
     */
    abstract deleteFeature(
        element: Element,
        elementFeature: ElementFeature
    ): void;

    /**
     * The properties of {@link CreatableElement} for which custom changes can be handled in {@link changeFeature}.
     */
    abstract readonly supportedChangeProperties: SupportedChangeProperties;
    /**
     * This method is guaranteed to only be called if only properties in {@link supportedChangeProperties} are different between the two elements
     * @param changedProperties The properties that have changed between the {@link oldElement } and the {@link newElement }
     * @param elementFeature The openLayers feature that should be updated to reflect the changes
     */
    abstract changeFeature(
        oldElement: Element,
        newElement: CreatableElement,
        changedProperties: SupportedChangeProperties,
        elementFeature: ElementFeature
    ): void;

    /**
     * This should be called if an element is changed.
     *
     * The best way to reflect the changes on the feature this is mostly to update the already created feature directly.
     * But because this requires extra code for each changed property it is not feasible to do for all properties.
     * The properties that are supported to be updated this way are saved in {@link supportedChangeProperties} and the changes are handled in {@link changeFeature}.
     * If any other property has changed, we deleted the old feature and create a new one instead.
     */
    public onElementChanged(oldElement: Element, newElement: Element): void {
        if (!this.canBeCreated(newElement)) {
            // the newElement is not valid anymore - we have to delete it
            this.onElementDeleted(oldElement);
            return;
        }
        const elementFeature = this.getElementFeature(oldElement);
        if (!elementFeature) {
            // If the element is not yet rendered on the map - we have to create it first
            this.onElementCreated(newElement);
            return;
        }
        const changedProperties = generateChangedProperties(
            oldElement,
            newElement
        );
        if (this.areAllPropertiesSupported(changedProperties)) {
            this.changeFeature(
                oldElement,
                newElement,
                changedProperties,
                elementFeature
            );
            return;
        }
        this.onElementDeleted(oldElement);
        this.onElementCreated(newElement);
    }

    private areAllPropertiesSupported(
        // ReadonlySet<keyof Element> doesn't work here, because ts seems to not consider CreatableElement to be a subtype of Element...
        changedProperties: ReadonlySet<any>
    ): changedProperties is SupportedChangeProperties {
        for (const changedProperty of changedProperties) {
            if (!this.supportedChangeProperties.has(changedProperty)) {
                return false;
            }
        }
        return true;
    }

    abstract getElementFeature(element: Element): ElementFeature | undefined;
}
