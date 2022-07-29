/**
 * Add all {@link elements} to {@link array}. This mutates {@link array}.
 * @param array The array to append to
 * @param elements The elements to append
 *
 * @remark Use this where something like `.push(...Array(300000).fill(1))` is possible.
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
