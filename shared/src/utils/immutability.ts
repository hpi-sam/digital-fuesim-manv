// TODO: Add typings for JsonObjects
/**
 * An immutable object is an object whose state cannot be modified.
 * Makes all properties in the given object readonly (recursive).
 *
 * The provided object should be a JSON object (no Maps, Sets, Functions, ...).
 */
export type Immutable<T extends object> = {
    readonly [K in keyof T]: T[K] extends object ? Immutable<T[K]> : T[K];
};

/**
 * A mutable object is an object whose state can be modified.
 * Removes all readonly modifiers from the given object (recursive).
 *
 * The provided object should be a JSON object (no Maps, Sets, Functions, ...).
 */
export type Mutable<T extends object> = {
    -readonly [K in keyof T]: T[K] extends object ? Mutable<T[K]> : T[K];
};

/**
 * An immutable object is an object whose state cannot be modified.
 * This represents a union of all JSON objects (no Maps, Sets, Functions, ...) that are immutable.
 * TODO: the type doesn't work yet.
 */
export type ImmutableJsonObject = Immutable<JsonObject>;

/**
 * This represents a union of all JSON objects (no Maps, Sets, Functions, ...).
 * TODO: the type doesn't work yet.
 */
interface JsonObject {
    [x: string]: any;
}
