import type { ImmutableJsonObject } from 'digital-fuesim-manv-shared';
import { isEqual } from 'lodash';

/**
 * @returns a Set of all the properties that are different between the two objects
 */
export function generateChangedProperties<Element extends ImmutableJsonObject>(
    oldElement: Element,
    newElement: Element
): Set<keyof Element> {
    const properties = new Set<keyof Element>([
        // there could be optional properties that are only in one element
        ...Object.keys(oldElement),
        ...Object.keys(newElement),
    ]);
    const changedProperties = new Set<keyof Element>();
    // add the changed properties to the Set
    for (const property of properties) {
        // It is potentially much more efficient to deep compare here instead of having to potentially rerender something unnecessarily
        if (!isEqual(oldElement[property], newElement[property])) {
            changedProperties.add(property);
        }
    }
    return changedProperties;
}
