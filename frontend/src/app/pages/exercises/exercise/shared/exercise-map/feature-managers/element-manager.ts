import type { ImmutableJsonObject } from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import { generateChangedProperties } from '../utility/generate-changed-properties';

/**
 * Provides an Api to update a feature based on changes to an element (patient, vehicle, etc.).
 *
 * {@link Element} is the immutable JSON object (Patient, Vehicle, etc.)
 * {@link Feature<FeatureType>} is the OpenLayers Feature that should be rendered to represent the {@link Element}.
 */
export abstract class ElementManager<
    Element extends ImmutableJsonObject,
    FeatureType extends Geometry
> {
    /**
     * This should be called if a new element is added.
     */
    public onElementCreated(element: Element) {
        const feature = this.createFeature(element);
        feature.set(featureElementKey, element);
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
        elementFeature.set(featureElementKey, newElement);
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
    abstract createFeature(element: Element): Feature<FeatureType>;

    /**
     * Delete the {@link elementFeature} representing the {@link element} from the map.
     */
    abstract deleteFeature(
        element: Element,
        elementFeature: Feature<FeatureType>
    ): void;

    /**
     * @param changedProperties The properties that have changed between the {@link oldElement} and the {@link newElement}
     * @param elementFeature The openLayers feature that should be updated to reflect the changes
     */
    abstract changeFeature(
        oldElement: Element,
        newElement: Element,
        changedProperties: ReadonlySet<keyof Element>,
        elementFeature: Feature<FeatureType>
    ): void;

    abstract getFeatureFromElement(
        element: Element
    ): Feature<FeatureType> | undefined;

    public getElementFromFeature(feature: Feature<any>) {
        return feature.get(featureElementKey);
    }
}

/**
 * The keys of the feature, where the type and most recent value of the respective element are saved to
 */
const featureElementKey = 'element';
