export interface MapValidationFunctions<K extends number | string | symbol, V> {
    keyValidator: (key: number | string | symbol) => key is K;
    valueValidator: (value: unknown) => value is V;
    consistencyValidator?: (key: string, value: unknown) => boolean;
}

/**
 * The provided flow is as follows:
 *
 * 1. It's checked whether `valueToBeValidated` is of type `object`
 * 2. It's checked whether `valueToBeValidated` is not `null`
 * 3. For every key-value pair of the object, the following are verified:
 *    1. It's checked whether the key fulfills {@link keyValidator}
 *    2. It's checked whether the transformed value is valid using {@link valueValidator}
 *    3. When {@link consistencyValidator} is provided, it's applied to the key and value
 *
 * This process is guaranteed to be short-circuiting, so later steps can rely on a successful earlier step.
 */
export function createMapValidator<K extends number | string | symbol, V>({
    keyValidator,
    valueValidator,
    consistencyValidator,
}: MapValidationFunctions<K, V>): (
    valueToBeValidated: unknown
) => valueToBeValidated is { [key in K]: V } {
    return (
        valueToBeValidated: unknown
    ): valueToBeValidated is { [key in K]: V } =>
        typeof valueToBeValidated === 'object' &&
        valueToBeValidated !== null &&
        Object.entries(valueToBeValidated).every(
            ([key, value]: [string, unknown]) =>
                keyValidator(key) &&
                valueValidator(value) &&
                (consistencyValidator === undefined ||
                    consistencyValidator(key, value as V))
        );
}
