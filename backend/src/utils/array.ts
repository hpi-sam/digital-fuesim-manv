/**
 * Add all {@link elements} to {@link array}. This mutates {@link array} and returns it.
 * @param array The array to append to
 * @param elements The elements to append
 * @returns The appended array
 */
export function pushAll<T>(array: T[], elements: T[]): T[] {
    elements.forEach((element) => array.push(element));
    return array;
}

/**
 * Make the provided {@link array} empty and return it.
 * @param array The array to make empty (in-place)
 * @returns The emptied array
 */
export function removeAll<T>(array: T[]): T[] {
    array.splice(0, array.length);
    return array;
}
