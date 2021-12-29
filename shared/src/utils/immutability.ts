// TODO: we only want to use Immutable and Mutable for JsonObjects (not for Maps, Sets, Functions, ...)
/**
 * An immutable object is an object whose state can not be modified.
 * Makes all properties in the given object readonly (recursive).
 */
export type Immutable<T extends object> = {
    readonly [K in keyof T]: T[K] extends object ? Immutable<T[K]> : T[K];
};

/**
 * A mutable object is an object whose state can be modified.
 * Removes all readonly modifiers from the given object (recursive).
 */
export type Mutable<T extends object> = {
    -readonly [K in keyof T]: T[K] extends object ? Mutable<T[K]> : T[K];
};

// TODO: Do we need this?
export interface JsonObject {
    [key: string]: JsonObject | JsonObject[] | JsonPrimitive | JsonPrimitive[];
}

/**
 * `undefined` is not a valid JSON value. You have to either use `null` or remove the property key from the object.
 * JSON.stringify() will (by default) treat all properties with `undefined` values as not existing.
 */
type JsonPrimitive = boolean | number | string | null;
