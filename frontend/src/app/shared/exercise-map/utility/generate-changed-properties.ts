/**
 * Both elements are expected to be immutable.
 * Therefore only shallow comparisons are made.
 * @returns a Set of all the properties that different between the two objects
 */
export function generateChangedProperties<
    Element extends Readonly<{ [key in string]?: any }>
>(oldElement: Element, newElement: Element): Set<keyof Element> {
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
    return changedProperties;
}
