import type {
    Immutable,
    ImmutableJsonObject,
} from 'digital-fuesim-manv-shared';

/**
 * Compares two immutable dictionaries and calls the correct handler for each element that is different between the two dictionaries.
 * @param createHandler Called for each element that is in the {@link newDictionary} but not in the {@link oldDictionary}.
 * @param deleteHandler Called for each element that was in the {@link oldDictionary} but is not in the {@link newDictionary}.
 * @param changeHandler Called for each element that is in both dictionaries and has changed.
 */
export function handleChanges<
    T extends ImmutableJsonObject,
    ImmutableT extends Immutable<T> = Immutable<T>
>(
    oldDictionary: Readonly<{ [key: string]: ImmutableT }>,
    newDictionary: Readonly<{ [key: string]: ImmutableT }>,
    createHandler: (newElement: ImmutableT) => void,
    deleteHandler: (deletedElement: ImmutableT) => void,
    changeHandler: (oldElement: ImmutableT, newElement: ImmutableT) => void
): void {
    const oldKeys = Object.keys(oldDictionary);
    oldKeys
        .filter((key) => newDictionary[key] === undefined)
        .forEach((key) => deleteHandler(oldDictionary[key]));
    const newKeys = Object.keys(newDictionary);
    newKeys
        .filter((key) => oldDictionary[key] === undefined)
        .forEach((key) => createHandler(newDictionary[key]));
    newKeys
        .filter(
            (key) =>
                oldDictionary[key] !== undefined &&
                oldDictionary[key] !== newDictionary[key]
        )
        .forEach((key) =>
            changeHandler(oldDictionary[key], newDictionary[key])
        );
}
