/**
 * Provides stricter typings for common `Object.` functions.
 * To do this, it is assumed that the provided object doesn't have more properties (at runtime) than specified in its type.
 * Based on how the TS type system works, this assumption cannot be made for every Object -> the default typings are very weak.
 * @See https://github.com/microsoft/TypeScript/pull/12253#issuecomment-263132208 and https://stackoverflow.com/questions/55012174/why-doesnt-object-keys-return-a-keyof-type-in-typescript
 */
export namespace StrictObject {
    /**
     * {@link Object.entries} with stricter typings
     * See {@link StrictObject}
     * @returns an array of key/values of the enumerable properties of an object
     */
    export function entries<T extends { [key: string]: any }>(
        object: T
    ): {
        [Key in keyof T]: [Key, T[Key]];
    }[keyof T][] {
        return Object.entries(object);
    }

    /**
     * {@link Object.values} with stricter typings
     * See {@link StrictObject}
     * @returns an array of values of the enumerable properties of an object
     */
    export function values<T extends { [key: string]: any }>(
        object: T
    ): T[keyof T][] {
        return Object.values(object);
    }

    /**
     * {@link Object.keys} with stricter typings
     * See {@link StrictObject}
     * @returns an array of keys of the enumerable properties of an object
     */
    export function keys<T extends { [key: string]: any }>(
        object: T
    ): (keyof T)[] {
        return Object.keys(object);
    }
}
