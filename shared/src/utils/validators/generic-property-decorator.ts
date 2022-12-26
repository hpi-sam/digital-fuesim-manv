export type GenericPropertyDecorator<T, Each extends boolean> = <
    Target extends {
        readonly [key in Key]: Each extends true ? readonly T[] : T;
    },
    Key extends string
>(
    target: Target,
    propertyKey: Key
) => void;
