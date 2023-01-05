/**
 * T The type the decorated property in the class must be. This only works for public properties.
 * Each Whether the Decorator is used to validate an array (https://github.com/typestack/class-validator#validating-arrays)
 */
export type GenericPropertyDecorator<T, Each extends boolean> = <
    Target extends {
        readonly [key in Key]: Each extends true ? readonly T[] : T;
    },
    Key extends string
>(
    target: Target,
    propertyKey: Key
) => void;
