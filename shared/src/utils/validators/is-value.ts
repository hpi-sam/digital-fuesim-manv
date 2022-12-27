import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isIn } from 'class-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';

/**
 * Check whether two values are identical, using {@link isIn} from `class-validator`.
 *
 * As of `class-validator` version `0.14.0`, this means that the equality check is doen with `===`.
 * @param expectedValue The single value that is allowed.
 * @param valueToBeValidated The actual value.
 * @returns Whether the values are identical.
 */
export function isValue<
    T extends bigint | boolean | number | string | symbol | null | undefined
>(expectedValue: T, valueToBeValidated: unknown): boolean {
    return isIn(valueToBeValidated, [expectedValue]);
}

/**
 * A validator for a constant value. Uses {@link isIn} for validation, all limitations of this validator apply.
 *
 * This means that, as of `class-validator` version `0.14.0`, `===` is used for equality checks.
 *
 * It is highly recommended to use `as const` with this decorator to enable better type checking.
 * @param expectedValue The single value that is allowed for this property.
 * @param validationOptions {@link ValidationOptions} passed on to `class-validator`.
 * @returns A `class-validator` validator that verifies that the value is exactly {@link expectedValue}.
 */
// TODO [typescript@>=5.0]: Use `const T` (https://github.com/microsoft/TypeScript/pull/51865) (and remove doc comment about `as const`)
// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsValue<
    T extends bigint | boolean | number | string | symbol | null | undefined,
    Each extends boolean = false
>(
    expectedValue: T,
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<T, Each> {
    return makeValidator<T, Each>(
        'isValue',
        (value: unknown, args?: ValidationArguments) =>
            isValue<T>(expectedValue, value),
        validationOptions
    );
}
