export interface ValidationFunctions<T> {
    keyValidator: (key: string) => boolean;
    // TODO: I'm not sure I'm happy with this system already.
    /**
     * This transformer may return a non-`T` object.
     */
    valueTransformer: (value: unknown) => T;
    /**
     * This validator must return `false` when {@link value} is not a `T` object.
     */
    valueValidator: (value: T) => boolean;
    consistencyValidator?: (key: string, value: T) => boolean;
}

// TODO: The formatting of the list is ugly as something removes the trailing whitespaces that would make it create newlines.
/**
 * The provided flow is as follows:
 *
 * 1. It's checked whether `valueToBeValidated` is of type `object`
 * 2. It's checked whether `valueToBeValidated` is not `null`
 * 3. For every key-value pair of the object, the following are verified:
 *
 *      a. It's checked whether the key fulfills {@link keyValidator}
 *
 *      b. The value gets converted to a (suspected, see {@link valueTransformer} and {@link valueValidator}) object of the target type using {@link valueTransformer}
 *
 *      c. It's checked whether the transformed value is valid using {@link valueValidator}
 *
 *      d. When {@link consistencyValidator} is provided, it's applied to the key and value
 *
 * This process is guaranteed to be short-circuiting, so later steps can rely on a successful earlier step.
 */
export function getMapValidator<T>({
    keyValidator,
    valueTransformer,
    valueValidator,
    consistencyValidator,
}: ValidationFunctions<T>): (valueToBeValidated: unknown) => boolean {
    return (valueToBeValidated: unknown): boolean =>
        typeof valueToBeValidated === 'object' &&
        valueToBeValidated !== null &&
        Object.entries(valueToBeValidated).every(
            ([key, value]: [string, unknown]) =>
                keyValidator(key) &&
                valueValidator(valueTransformer(value)) &&
                (consistencyValidator === undefined ||
                    consistencyValidator(key, valueTransformer(value)))
        );
}
