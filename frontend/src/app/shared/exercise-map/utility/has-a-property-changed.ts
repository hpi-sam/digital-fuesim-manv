/**
 * @returns wether a not ignored property is different between the two objects
 */
export function hasAPropertyChanged<
    T extends Readonly<{ [key in Keys]?: any }>,
    Keys extends keyof T = keyof T
>(oldElement: T, newElement: T, ignoredProperties: Keys[]): boolean {
    const keys = [
        ...Object.keys(oldElement),
        ...Object.keys(newElement),
    ] as Keys[];
    return keys
        .filter((key) => !ignoredProperties.includes(key))
        .some((key) => oldElement[key] !== newElement[key]);
}
