export type GenericPropertyDecorator<T> = <
    Target extends { readonly [key in Key]: T },
    Key extends string
>(
    target: Target,
    propertyKey: Key
) => void;
