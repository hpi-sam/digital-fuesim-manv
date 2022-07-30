export function sortSet<T, V, O extends boolean>(
    set: { [key: string]: V },
    orderByValue: O,
    mapper: O extends true ? (value: V) => T : (key: string) => T,
    sorter: (left: T, right: T) => number
): { [key: string]: V } {
    const compareElements = Object.entries(set).map(
        ([key, value]) =>
            [
                orderByValue
                    ? (mapper as (value: V) => T)(value)
                    : (mapper as (key: string) => T)(key),
                key,
                value,
            ] as const
    );
    compareElements.sort((left, right) => sorter(left[0], right[0]));
    return Object.fromEntries(
        compareElements.map((elem) => [elem[1], elem[2]])
    );
}
