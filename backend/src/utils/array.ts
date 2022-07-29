/**
 * Add all {@link elements} to {@link array}. This mutates {@link array}.
 * @param array The array to append to
 * @param elements The elements to append
 *
 * @remark You can't use `myArray.push(...elementsToBeAdded)` if `elementsToBeAdded` could have more than ca. 130,000 elements, because there is a maximum number of function parameters (based in the stack size). This function works with such big arrays too.
 */
export function pushAll<T>(array: T[], elements: T[]): void {
    elements.forEach((element) => array.push(element));
}

/**
 * Make the provided {@link array} empty.
 * @param array The array to make empty (in-place)
 */
export function removeAll<T>(array: T[]): void {
    array.splice(0, array.length);
}
