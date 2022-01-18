/**
 * @returns wether a not ignored property is different between the two objects
 */
export function hasAPropertyChanged<
    T extends Readonly<{ [key in Key]?: any }>,
    Key extends keyof T = keyof T
>(
    oldElement: T,
    newElement: T,
    ignoredProperties: ReadonlyArray<Key>
): boolean {
    const keys = [
        ...Object.keys(oldElement),
        ...Object.keys(newElement),
    ] as Key[];
    return keys
        .filter((key) => !ignoredProperties.includes(key))
        .some((key) => oldElement[key] !== newElement[key]);
}
