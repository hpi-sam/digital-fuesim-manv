/**
 * Provides an Api to render an element
 * The {@link Element} must be immutable.
 */
export abstract class ElementRenderer<Element extends object> {
    abstract createElement(element: Element): void;
    /**
     * Delete the rendered element (if it exists)
     */
    abstract deleteElement(element: Element): void;

    /**
     * The properties of {@link Element} for which custom changes can be handled
     */
    abstract readonly supportedChangeProperties: ReadonlyArray<keyof Element>;
    /**
     * This method is guaranteed to only be called if all properties that are different between the two elements are in {@link supportedChangeProperties}
     * It should update the rendered element to reflect these new properties
     */
    abstract customizedChangeElement(
        oldElement: Element,
        newElement: Element,
        changedProperties: Set<keyof Element>
    ): void;

    /**
     * This function updates the rendered element to reflect new properties.
     *
     * The best way to do this is mostly to update the already rendered element directly.
     * Because this mostly requires extra code and is not feasible to do for all elements,
     * the properties that are supported to be updated this way are saved in {@link supportedChangeProperties} and
     * implemented in {@link customizedChangeElement}.
     * To still guarantee that the element is updated, we deleted the old rendered element and create a new one,
     * if another than a {@link supportedChangeProperties} has been changed.
     */
    public changeElement(oldElement: Element, newElement: Element): void {
        const properties = [
            // there could be optional properties that are only in one element
            ...Object.keys(oldElement),
            ...Object.keys(newElement),
        ] as (keyof Element)[];
        const changedProperties = new Set<keyof Element>();
        // add the changed properties to the Set
        for (const property of properties) {
            if (oldElement[property] !== newElement[property]) {
                changedProperties.add(property);
            }
        }
        for (const changedProperty of changedProperties) {
            if (!this.supportedChangeProperties.includes(changedProperty)) {
                this.deleteElement(oldElement);
                this.createElement(newElement);
                return;
            }
        }
        this.customizedChangeElement(oldElement, newElement, changedProperties);
    }
}
